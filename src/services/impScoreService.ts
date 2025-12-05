import type { Pool } from 'pg';
import pool from '../database/index.js';

export interface ImpScoreResult {
  score: number;
  breakdown: Record<string, number>;
}

export interface MatchStats {
  matchId: string;
  steamId: string;
  discordId: string;
  heroId: number;
  gpm: number;
  xpm: number;
  kills: number;
  deaths: number;
  assists: number;
  netWorth: number;
  duration: number;
  victory: boolean;
  rankTier?: number;
}

export function calculateImpScore(stats: MatchStats): ImpScoreResult {
  const safety = stats.deaths === 0 ? 1.2 : Math.max(0.5, 1 - stats.deaths / Math.max(10, stats.duration / 60));
  const kda = (stats.kills + stats.assists) / Math.max(1, stats.deaths);
  const economy = (stats.gpm + stats.xpm) / 2 / 1000; // normalize
  const impact = (stats.netWorth / Math.max(1, stats.duration)) / 50;
  const winBonus = stats.victory ? 0.15 : -0.1;

  const raw = 50 + kda * 10 + economy * 20 + impact * 15 + winBonus * 100 * safety;
  const score = Math.max(-100, Math.min(100, Number(raw.toFixed(2))));

  return {
    score,
    breakdown: {
      kda,
      economy,
      impact,
      safety,
      winBonus,
    },
  };
}

export async function persistImpScore(poolRef: Pool, stats: MatchStats, result: ImpScoreResult): Promise<void> {
  await poolRef.query(
    `INSERT INTO match_imp_scores (match_id, discord_id, steam_id, hero_id, imp_score, rank_tier)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (match_id, steam_id) DO UPDATE SET imp_score = EXCLUDED.imp_score, rank_tier = EXCLUDED.rank_tier`,
    [stats.matchId, stats.discordId, stats.steamId, stats.heroId, result.score, stats.rankTier || 0]
  );
}

export async function saveImpScore(stats: MatchStats, result: ImpScoreResult): Promise<void> {
  await persistImpScore(pool, stats, result);
}
