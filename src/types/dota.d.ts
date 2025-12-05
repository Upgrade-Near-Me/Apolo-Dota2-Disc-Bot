/**
 * Dota 2 Data Type Definitions
 * 
 * Type definitions for Dota 2 matches, players, and game data.
 * All interfaces follow strict TypeScript conventions.
 */

/* ============================================
 * MATCH TYPES
 * ============================================ */

export interface DotaMatch {
  matchId: string;
  steamId: string;
  heroId: number;
  heroName: string;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;              // Gold per minute
  xpm: number;              // Experience per minute
  netWorth: number;
  duration: number;         // Match duration in seconds
  victory: boolean;
  playedAt: Date;
  items: number[];          // Array of item IDs
  lane: LaneType;
  role: RoleType;
}

export type LaneType = 'SAFE' | 'MID' | 'OFF' | 'JUNGLE' | 'ROAMING';
export type RoleType = 'CARRY' | 'SUPPORT' | 'OFFLANE' | 'MID' | 'HARD_SUPPORT';

/* ============================================
 * PLAYER TYPES
 * ============================================ */

export interface PlayerProfile {
  steamId: string;
  discordId: string;
  name: string;
  avatarUrl: string;
  rank: string;             // 'Herald', 'Guardian', ..., 'Immortal'
  mmr: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;          // Percentage (0-100)
  avgGpm: number;
  avgXpm: number;
  topHeroes: TopHero[];
}

export interface TopHero {
  heroId: number;
  heroName: string;
  games: number;
  winRate: number;          // Percentage (0-100)
}

/* ============================================
 * STRATZ API TYPES (GraphQL Responses)
 * ============================================ */

/**
 * Stratz Hero Information
 */
export interface StratzHero {
  id: number;
  displayName: string;
}

/**
 * Stratz Player Profile Response
 * From: query player(steamAccountId)
 */
export interface StratzPlayerResponse {
  player: {
    steamAccount: {
      id: number;
      name: string;
      avatar: string;
    };
    matchCount: number;
    winCount: number;
    lossCount: number;
    ranks?: Array<{
      rank: number;
      seasonRankId: number;
    }>;
    heroesPerformance?: Array<{
      hero: StratzHero;
      matchCount: number;
      winCount: number;
    }>;
  };
}

/**
 * Stratz Single Match Response
 * From: query match(id)
 */
export interface StratzMatchResponse {
  match: {
    id: number;
    didRadiantWin: boolean;
    durationSeconds: number;
    startDateTime: number;
    players: StratzMatchPlayer[];
  };
}

/**
 * Stratz Match Player Details
 */
export interface StratzMatchPlayer {
  steamAccountId: number;
  heroId: number;
  hero?: StratzHero;
  isRadiant: boolean;
  kills: number;
  deaths: number;
  assists: number;
  goldPerMinute: number;
  experiencePerMinute: number;
  networth: number;
  item0Id?: number | null;
  item1Id?: number | null;
  item2Id?: number | null;
  item3Id?: number | null;
  item4Id?: number | null;
  item5Id?: number | null;
  leaverStatus?: number;
  lane?: number;
  role?: number;
}

/**
 * Stratz Match History Response
 * From: query player { matches }
 */
export interface StratzMatchHistoryResponse {
  player: {
    matches: Array<{
      id: number;
      didRadiantWin: boolean;
      durationSeconds: number;
      startDateTime: number;
      players: StratzMatchPlayer[];
    }>;
  };
}

/**
 * Simplified/Parsed Stratz Types (for internal use)
 */
export interface ParsedStratzPlayer {
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  rank: string | number;
  topHeroes: Array<{
    name: string;
    matches: number;
    wins: number;
    winRate: number;
  }>;
}

export interface ParsedStratzMatch {
  matchId: string;
  result: 'WIN' | 'LOSS';
  heroName: string;
  heroId: number;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  duration: number;
  playedAt: Date;
  items: number[];
}

export interface ParsedStratzHistory {
  matchId: string;
  won: boolean;
  gpm: number;
  xpm: number;
}

/* ============================================
 * DISCORD TYPES (Augmentations)
 * ============================================ */

import type { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  ButtonInteraction, 
  ModalSubmitInteraction,
  Collection 
} from 'discord.js';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  handleButton?: (interaction: ButtonInteraction) => Promise<void>;
  handleModal?: (interaction: ModalSubmitInteraction) => Promise<void>;
}

/* ============================================
 * UTILITY TYPES
 * ============================================ */

export type Locale = 'en' | 'pt' | 'es';

export interface TranslationParams {
  [key: string]: string | number;
}
