/**
 * DATABASE MIGRATION - V2.0 Dashboard Tables
 * Creates tables for LFG System and Content Hub
 * 
 * @version 2.0.0
 */

-- ============================================
-- LFG (Looking for Group) System
-- ============================================

CREATE TABLE IF NOT EXISTS lfg_queue (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(20) NOT NULL,
  guild_id VARCHAR(20) NOT NULL,
  role VARCHAR(20), -- 'CORE', 'SUPPORT', 'UNKNOWN'
  skill_level VARCHAR(20), -- 'BEGINNER', 'VETERAN', 'UNKNOWN'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(discord_id, guild_id)
);

CREATE INDEX IF NOT EXISTS idx_lfg_queue_guild ON lfg_queue(guild_id);
CREATE INDEX IF NOT EXISTS idx_lfg_queue_discord ON lfg_queue(discord_id);
CREATE INDEX IF NOT EXISTS idx_lfg_queue_created ON lfg_queue(created_at);

-- ============================================
-- User Social Links
-- ============================================

CREATE TABLE IF NOT EXISTS user_socials (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(20) UNIQUE NOT NULL,
  twitch VARCHAR(255),
  youtube VARCHAR(255),
  twitter VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_socials_discord ON user_socials(discord_id);

-- ============================================
-- Cleanup Old Entries (Auto-expire after 24h)
-- ============================================

-- Function to clean old LFG entries
CREATE OR REPLACE FUNCTION cleanup_old_lfg() RETURNS void AS $$
BEGIN
  DELETE FROM lfg_queue WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run manually or via cron)
-- SELECT cleanup_old_lfg();
