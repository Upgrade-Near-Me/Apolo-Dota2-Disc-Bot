/**
 * E2E Test Helpers - Mock Data & Utilities
 * 
 * Provides mock data for testing without consuming API quota
 */

import type { ParsedStratzPlayer, ParsedStratzMatch } from '../../src/types/dota.js';

/**
 * Mock player profile data (RTZ-like profile)
 */
export const mockPlayerProfile: ParsedStratzPlayer = {
  steamId: '115431346',
  name: 'Arteezy',
  avatar: 'https://avatars.cloudflare.steamstatic.com/example.jpg',
  rank: 'Immortal',
  mmr: 8500,
  totalMatches: 12000,
  wins: 6600,
  losses: 5400,
  winRate: 55.0,
  avgGpm: 625,
  avgXpm: 680,
  topHeroes: [
    { heroId: 1, heroName: 'Anti-Mage', games: 450, winRate: 58.5 },
    { heroId: 11, heroName: 'Shadow Fiend', games: 380, winRate: 54.2 },
    { heroId: 74, heroName: 'Invoker', games: 320, winRate: 52.8 },
  ],
};

/**
 * Mock match data
 */
export const mockMatch: ParsedStratzMatch = {
  matchId: '7234567890',
  steamId: '115431346',
  heroId: 1,
  heroName: 'Anti-Mage',
  kills: 12,
  deaths: 3,
  assists: 8,
  gpm: 725,
  xpm: 780,
  netWorth: 28500,
  duration: 2340, // 39 minutes
  victory: true,
  playedAt: new Date('2024-12-01T15:30:00Z'),
  items: [1, 63, 108, 123, 156, 232], // Example item IDs
  lane: 'SAFE',
  role: 'CARRY',
};

/**
 * Mock match history (array of matches)
 */
export const mockMatchHistory: ParsedStratzMatch[] = [
  mockMatch,
  {
    ...mockMatch,
    matchId: '7234567891',
    heroName: 'Phantom Assassin',
    kills: 15,
    deaths: 5,
    assists: 6,
    victory: true,
  },
  {
    ...mockMatch,
    matchId: '7234567892',
    heroName: 'Terrorblade',
    kills: 8,
    deaths: 7,
    assists: 4,
    victory: false,
  },
];

/**
 * Wait helper for async tests
 */
export const wait = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random Steam ID for testing
 */
export const generateSteamId = (): string => {
  return Math.floor(Math.random() * 1000000000).toString();
};

/**
 * Check if running in CI environment
 */
export const isCI = (): boolean => {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
};

/**
 * Skip test in CI if API keys not available
 */
export const skipInCIWithoutKeys = (): boolean => {
  if (isCI()) {
    const hasStratzKey = Boolean(process.env.STRATZ_API_TOKEN);
    const hasSteamKey = Boolean(process.env.STEAM_API_KEY);
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
    
    return !hasStratzKey || !hasSteamKey || !hasGeminiKey;
  }
  return false;
};

/**
 * Retry helper for flaky API calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await wait(delay);
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Validate player profile structure
 */
export function validatePlayerProfile(profile: any): boolean {
  if (!profile) return false;
  
  const required = ['steamId', 'name', 'avatar'];
  const hasRequired = required.every(field => field in profile);
  
  if (!hasRequired) return false;
  
  // Validate types
  if (typeof profile.steamId !== 'string') return false;
  if (typeof profile.name !== 'string') return false;
  if (typeof profile.avatar !== 'string') return false;
  
  // Optional fields type validation
  if (profile.mmr && typeof profile.mmr !== 'number') return false;
  if (profile.totalMatches && typeof profile.totalMatches !== 'number') return false;
  if (profile.wins && typeof profile.wins !== 'number') return false;
  
  return true;
}

/**
 * Validate match structure
 */
export function validateMatch(match: any): boolean {
  if (!match) return false;
  
  const required = [
    'matchId', 'steamId', 'heroId', 'heroName',
    'kills', 'deaths', 'assists', 'gpm', 'xpm',
    'victory', 'duration'
  ];
  
  const hasRequired = required.every(field => field in match);
  if (!hasRequired) return false;
  
  // Validate numeric ranges
  if (match.kills < 0 || match.deaths < 0 || match.assists < 0) return false;
  if (match.gpm <= 0 || match.xpm <= 0) return false;
  if (match.duration <= 0) return false;
  if (typeof match.victory !== 'boolean') return false;
  
  return true;
}
