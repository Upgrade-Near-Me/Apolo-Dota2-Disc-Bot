import type { Pool } from 'pg';
import pool from '../database/index.js';

export interface XpGrant {
  discordId: string;
  source: 'match' | 'message' | 'voice' | 'award' | 'admin';
  amount: number;
}

export interface LevelState {
  discordId: string;
  xp: number;
  level: number;
}

function levelForXp(xp: number): number {
  // Simple leveling curve: level n requires n^2 * 100 xp
  let level = 1;
  while (xp >= (level + 1) * (level + 1) * 100) {
    level += 1;
  }
  return level;
}

export async function grantXp(poolRef: Pool, grant: XpGrant): Promise<LevelState> {
  const result = await poolRef.query<{ xp: string; level: number }>(
    `INSERT INTO user_xp (discord_id, xp, level)
     VALUES ($1, $2, $3)
     ON CONFLICT (discord_id) DO UPDATE SET xp = user_xp.xp + $4, level = user_xp.level
     RETURNING xp, level`,
    [grant.discordId, grant.amount, 1, grant.amount]
  );

  const row = result.rows[0];
  const xp = Number(row?.xp || 0);
  let level = row?.level || 1;
  const newLevel = levelForXp(xp);
  if (newLevel > level) {
    level = newLevel;
    await poolRef.query('UPDATE user_xp SET level = $1 WHERE discord_id = $2', [level, grant.discordId]);
  }

  await poolRef.query(
    'INSERT INTO xp_events (discord_id, source, delta, xp_after) VALUES ($1, $2, $3, $4)',
    [grant.discordId, grant.source, grant.amount, xp]
  );

  return { discordId: grant.discordId, xp, level };
}

export async function grantMatchXp(discordId: string, durationSeconds: number): Promise<LevelState> {
  const base = 50;
  const perMinute = 5;
  const total = base + Math.round((durationSeconds / 60) * perMinute);
  return grantXp(pool, { discordId, source: 'match', amount: total });
}
