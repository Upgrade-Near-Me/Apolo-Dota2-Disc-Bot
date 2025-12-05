import { getLastMatch } from './openDotaService.js';
import { resolveLocale, tInteraction } from '../utils/i18n.js';
import { redisService } from './RedisService.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Locale } from '../types/dota.js';

type OpenDotaRankingRow = { account_id: number; percent_rank: number | null };
type OpenDotaRankingResponse = { rankings?: OpenDotaRankingRow[] };

export interface BenchmarkEntry {
  percentile: number;
  value: number;
}

export interface HeroBenchmark {
  heroId: number;
  heroName: string;
  benchmarks: Record<string, BenchmarkEntry>;
}

export interface PlayerBenchmarks {
  steamId: string;
  locale: Locale;
  entries: HeroBenchmark[];
}

// Simple wrapper that picks the top hero from last match and returns its percentile benchmarks
export async function getBenchmarksForLastMatch(
  steamId: string,
  interaction: ChatInputCommandInteraction
): Promise<PlayerBenchmarks | null> {
  // Use OpenDota rankings endpoint per hero
  const lastMatch = await getLastMatch(steamId);
  if (!lastMatch) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const locale = await resolveLocale(interaction);
  const heroId = lastMatch.heroId;

  // Check Redis cache first (5 minute TTL for benchmarks)
  const cacheKey = `benchmark:${heroId}`;
  const cached = await redisService.get<OpenDotaRankingResponse>(cacheKey);
  
  let data: OpenDotaRankingResponse;
  if (cached) {
    data = cached;
  } else {
    const response = await fetch(`https://api.opendota.com/api/rankings?hero_id=${heroId}`);
    if (!response.ok) return null;

    data = (await response.json()) as OpenDotaRankingResponse;
    // Cache for 5 minutes (300 seconds)
    await redisService.set(cacheKey, data, 300);
  }

  const percentile = data.rankings?.find((r) => String(r.account_id) === steamId)?.percent_rank ?? 0;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  let resolvedHeroName: string;
  if (lastMatch.heroName) {
    resolvedHeroName = lastMatch.heroName;
  } else {
    const translated = await (tInteraction as (i: ChatInputCommandInteraction, key: string) => Promise<string>)(
      interaction,
      'hero_unknown'
    );
    resolvedHeroName = translated;
  }

  const entry: HeroBenchmark = {
    heroId,
    heroName: resolvedHeroName,
    benchmarks: {
      percentile: {
        percentile: percentile ? Math.round(percentile * 100) : 0,
        value: percentile || 0,
      },
    },
  };

  return {
    steamId,
    locale,
    entries: [entry],
  };
}
