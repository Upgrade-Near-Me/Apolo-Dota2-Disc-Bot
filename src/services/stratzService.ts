/**
 * Stratz API Service - TypeScript with Redis Caching
 * 
 * Purpose: Fetch Dota 2 data from Stratz GraphQL API with automatic caching
 * Features:
 * - Redis caching to prevent 429 rate limit errors
 * - Automatic fallback to OpenDota if Stratz fails
 * - Graceful degradation if Redis is unavailable
 * - Type-safe responses
 */

import { GraphQLClient } from 'graphql-request';
import config from '../config/index.js';
import * as openDota from './openDotaService.js';
import { redisService, CacheTTL } from './RedisService.js';
import logger from '../utils/logger.js';
import { checkRateLimit } from '../utils/rateLimiter.js';
import { getApiKey, isServiceEnabled, markKeyAsCooldown } from '../utils/apiKeyPool.js';
import type { 
  StratzPlayerResponse, 
  StratzMatchHistoryResponse,
  ParsedStratzPlayer,
  ParsedStratzMatch,
  ParsedStratzHistory
} from '../types/dota.js';

// Check if API token is configured
const legacyStratzToken = config.api.stratz.token && config.api.stratz.token !== 'your_stratz_api_token_here'
  ? config.api.stratz.token
  : null;
const STRATZ_ENABLED = Boolean(isServiceEnabled('stratz') || legacyStratzToken);

function getStratzClient(): { client: GraphQLClient | null; key: string | null } {
  const key = getApiKey('stratz') ?? legacyStratzToken;
  if (!key) return { client: null, key: null };
  const client = new GraphQLClient(config.api.stratz.endpoint, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });
  return { client, key };
}

function isQuotaError(error: unknown): boolean {
  const anyErr = error as any;
  const status = anyErr?.response?.status || anyErr?.response?.statusCode;
  if (status === 429 || status === 403) return true;
  const message = (anyErr?.message || '').toString().toLowerCase();
  return message.includes('rate limit') || message.includes('429') || message.includes('quota') || message.includes('too many');
}

const RateLimits = {
  stratz: { key: 'rl:stratz:global', limit: 90, windowSeconds: 60 },
  opendota: { key: 'rl:opendota:global', limit: 50, windowSeconds: 60 },
} as const;

/**
 * Cache key generators
 */
const CacheKeys = {
  lastMatch: (steamId: string) => `stratz:match:${steamId}:last`,
  playerProfile: (steamId: string) => `stratz:profile:${steamId}`,
  matchHistory: (steamId: string, limit: number) => `stratz:history:${steamId}:${limit}`,
};

async function fetchFromOpenDotaWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const data = await fetcher();
  await redisService.set(cacheKey, data, ttl);
  return data;
}

/**
 * Get player's last match with caching
 * Cache TTL: 24 hours (matches never change)
 * 
 * @param steamId - Steam account ID (32-bit)
 * @returns Last match data or null
 */
export async function getLastMatch(steamId: string): Promise<ParsedStratzMatch | null> {
  // Check cache first
  const cacheKey = CacheKeys.lastMatch(steamId);
  const cached = await redisService.get<ParsedStratzMatch>(cacheKey);
  
  if (cached) {
    logger.info({ steamId }, 'Cache hit: last match');
    return cached;
  }

  // If Stratz disabled, use OpenDota
  if (!STRATZ_ENABLED) {
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getLastMatch(steamId), CacheTTL.MATCH_DATA) as any;
  }

  const { client, key } = getStratzClient();
  if (!client) {
    logger.warn({ steamId }, 'Stratz client unavailable, using OpenDota fallback');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getLastMatch(steamId), CacheTTL.MATCH_DATA) as any;
  }

  const rate = await checkRateLimit({ ...RateLimits.stratz, context: 'stratzService.getLastMatch' });
  if (!rate.allowed) {
    logger.warn({ steamId, retryAfter: rate.retryAfter }, 'Stratz rate limited, falling back to OpenDota');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getLastMatch(steamId), CacheTTL.MATCH_DATA) as any;
  }

  const query = `
    query GetLastMatch($steamAccountId: Long!) {
      player(steamAccountId: $steamAccountId) {
        matches(request: { take: 1 }) {
          id
          didRadiantWin
          durationSeconds
          startDateTime
          players(steamAccountId: $steamAccountId) {
            steamAccountId
            isRadiant
            hero {
              id
              displayName
            }
            kills
            deaths
            assists
            goldPerMinute
            experiencePerMinute
            networth
            item0Id
            item1Id
            item2Id
            item3Id
            item4Id
            item5Id
          }
        }
      }
    }
  `;

  const variables = {
    steamAccountId: parseInt(steamId, 10),
  };

  try {
    logger.info({ steamId }, 'Fetching last match from Stratz');
    const data = await client.request<StratzMatchHistoryResponse>(query, variables);
    const parsed = parseMatchData(data);

    // Cache the result
    await redisService.set(cacheKey, parsed, CacheTTL.MATCH_DATA);

    return parsed;
  } catch (error) {
    logger.error({ error, steamId }, 'Stratz API error: last match');
    if (isQuotaError(error)) {
      markKeyAsCooldown('stratz', key);
    }
    // Fallback to OpenDota
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getLastMatch(steamId), CacheTTL.MATCH_DATA) as any;
  }
}

/**
 * Get player profile summary with caching
 * Cache TTL: 1 hour (profiles change slowly)
 * 
 * @param steamId - Steam account ID (32-bit)
 * @returns Player profile data
 */
export async function getPlayerProfile(steamId: string): Promise<ParsedStratzPlayer | null> {
  // Check cache first
  const cacheKey = CacheKeys.playerProfile(steamId);
  const cached = await redisService.get<ParsedStratzPlayer>(cacheKey);
  
  if (cached) {
    logger.info({ steamId }, 'Cache hit: player profile');
    return cached;
  }

  // If Stratz disabled, use OpenDota
  if (!STRATZ_ENABLED) {
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getPlayerProfile(steamId), CacheTTL.PLAYER_PROFILE) as any;
  }

  const { client, key } = getStratzClient();

  const rate = await checkRateLimit({ ...RateLimits.stratz, context: 'stratzService.getPlayerProfile' });
  if (!rate.allowed) {
    logger.warn({ steamId, retryAfter: rate.retryAfter }, 'Stratz rate limited, using OpenDota profile fallback');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getPlayerProfile(steamId), CacheTTL.PLAYER_PROFILE) as any;
  }

  if (!client) {
    logger.warn({ steamId }, 'Stratz client unavailable, using OpenDota profile fallback');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getPlayerProfile(steamId), CacheTTL.PLAYER_PROFILE) as any;
  }

  const query = `
    query GetPlayerProfile($steamAccountId: Long!) {
      player(steamAccountId: $steamAccountId) {
        steamAccount {
          id
          name
          avatar
        }
        winCount
        lossCount
        matchCount
        ranks {
          rank
        }
        heroesPerformance(request: { take: 5 }) {
          hero {
            id
            displayName
          }
          matchCount
          winCount
        }
      }
    }
  `;

  const variables = {
    steamAccountId: parseInt(steamId, 10),
  };

  try {
    logger.info({ steamId }, 'Fetching profile from Stratz');
    const data = await client.request<StratzPlayerResponse>(query, variables);
    const parsed = parsePlayerData(data);

    // Cache the result
    await redisService.set(cacheKey, parsed, CacheTTL.PLAYER_PROFILE);

    return parsed;
  } catch (error) {
    logger.error({ error, steamId }, 'Stratz API error: player profile');
    if (isQuotaError(error)) {
      markKeyAsCooldown('stratz', key);
    }
    // Fallback to OpenDota
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getPlayerProfile(steamId), CacheTTL.PLAYER_PROFILE) as any;
  }
}

/**
 * Get player match history for progress tracking with caching
 * Cache TTL: 30 minutes (recent matches may update)
 * 
 * @param steamId - Steam account ID (32-bit)
 * @param limit - Number of matches to fetch (default: 20)
 * @returns Array of match history data
 */
export async function getMatchHistory(steamId: string, limit = 20): Promise<ParsedStratzHistory[]> {
  // Check cache first
  const cacheKey = CacheKeys.matchHistory(steamId, limit);
  const cached = await redisService.get<ParsedStratzHistory[]>(cacheKey);
  
  if (cached) {
    logger.info({ steamId, limit }, 'Cache hit: match history');
    return cached;
  }

  // If Stratz disabled, use OpenDota
  if (!STRATZ_ENABLED) {
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getMatchHistory(steamId, limit), CacheTTL.MATCH_HISTORY) as any;
  }

  const { client, key } = getStratzClient();

  const rate = await checkRateLimit({ ...RateLimits.stratz, context: 'stratzService.getMatchHistory' });
  if (!rate.allowed) {
    logger.warn({ steamId, limit, retryAfter: rate.retryAfter }, 'Stratz rate limited, using OpenDota history fallback');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getMatchHistory(steamId, limit), CacheTTL.MATCH_HISTORY) as any;
  }

  if (!client) {
    logger.warn({ steamId, limit }, 'Stratz client unavailable, using OpenDota history fallback');
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getMatchHistory(steamId, limit), CacheTTL.MATCH_HISTORY) as any;
  }

  const query = `
    query GetMatchHistory($steamAccountId: Long!, $take: Int!) {
      player(steamAccountId: $steamAccountId) {
        matches(request: { take: $take }) {
          id
          didRadiantWin
          players(steamAccountId: $steamAccountId) {
            isRadiant
            goldPerMinute
            experiencePerMinute
          }
        }
      }
    }
  `;

  const variables = {
    steamAccountId: parseInt(steamId, 10),
    take: limit,
  };

  try {
    logger.info({ steamId, limit }, 'Fetching match history from Stratz');
    const data = await client.request<StratzMatchHistoryResponse>(query, variables);
    const parsed = parseHistoryData(data);

    // Cache the result
    await redisService.set(cacheKey, parsed, CacheTTL.MATCH_HISTORY);

    return parsed;
  } catch (error) {
    logger.error({ error, steamId, limit }, 'Stratz API error: match history');
    if (isQuotaError(error)) {
      markKeyAsCooldown('stratz', key);
    }
    // Fallback to OpenDota
    await checkRateLimit({ ...RateLimits.opendota, context: 'stratzService.opendotaFallback' });
    return fetchFromOpenDotaWithCache(cacheKey, () => openDota.getMatchHistory(steamId, limit), CacheTTL.MATCH_HISTORY) as any;
  }
}

/**
 * Invalidate cache for a specific player
 * Useful when forcing a refresh
 * 
 * @param steamId - Steam account ID (32-bit)
 */
export async function invalidatePlayerCache(steamId: string): Promise<void> {
  await redisService.del(CacheKeys.lastMatch(steamId));
  await redisService.del(CacheKeys.playerProfile(steamId));
  // Delete all history caches for this player
  await redisService.delPattern(`stratz:history:${steamId}:*`);
  console.log(`🗑️ Cache invalidated for player ${steamId}`);
}

/* ============================================
 * INTERNAL PARSING FUNCTIONS
 * ============================================ */

/**
 * Parse match data from Stratz response
 * Converts GraphQL structure to simplified internal format
 */
function parseMatchData(data: StratzMatchHistoryResponse): ParsedStratzMatch {
  const match = data.player.matches[0];
  
  if (!match) {
    throw new Error('No match data found');
  }
  
  const player = match.players[0];
  
  if (!player) {
    throw new Error('No player data found in match');
  }
  
  const won = (player.isRadiant && match.didRadiantWin) || (!player.isRadiant && !match.didRadiantWin);

  return {
    matchId: match.id.toString(),
    result: won ? 'WIN' : 'LOSS',
    heroName: player.hero?.displayName ?? 'Unknown Hero',
    heroId: player.hero?.id ?? 0,
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    gpm: player.goldPerMinute,
    xpm: player.experiencePerMinute,
    netWorth: player.networth,
    duration: match.durationSeconds,
    playedAt: new Date(match.startDateTime * 1000),
    items: [
      player.item0Id,
      player.item1Id,
      player.item2Id,
      player.item3Id,
      player.item4Id,
      player.item5Id,
    ].filter((id): id is number => id !== null && id !== undefined),
  };
}

/**
 * Parse player profile data from Stratz response
 * Calculates win rates and formats hero performance
 */
function parsePlayerData(data: StratzPlayerResponse): ParsedStratzPlayer {
  const player = data.player;
  const winRate = player.matchCount > 0 
    ? parseFloat(((player.winCount / player.matchCount) * 100).toFixed(1))
    : 0;

  return {
    name: player.steamAccount.name,
    avatar: player.steamAccount.avatar,
    wins: player.winCount,
    losses: player.lossCount,
    totalMatches: player.matchCount,
    winRate,
    rank: player.ranks?.[0]?.rank ?? 'Unranked',
    topHeroes: player.heroesPerformance?.map(h => ({
      name: h.hero.displayName,
      matches: h.matchCount,
      wins: h.winCount,
      winRate: h.matchCount > 0 
        ? parseFloat(((h.winCount / h.matchCount) * 100).toFixed(1))
        : 0,
    })) ?? [],
  };
}

/**
 * Parse match history for progress charts
 * Returns matches in chronological order (oldest first)
 */
function parseHistoryData(data: StratzMatchHistoryResponse): ParsedStratzHistory[] {
  return data.player.matches
    .map(match => {
      const player = match.players[0];
      
      // Skip if player data is missing
      if (!player) {
        return null;
      }
      
      const won = (player.isRadiant && match.didRadiantWin) || (!player.isRadiant && !match.didRadiantWin);
      
      return {
        matchId: match.id.toString(),
        won,
        gpm: player.goldPerMinute,
        xpm: player.experiencePerMinute,
      };
    })
    .filter((match): match is ParsedStratzHistory => match !== null)
    .reverse(); // Chronological order (oldest first)
}

// Default export for compatibility

