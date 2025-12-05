import pool from './index.js';

const migrations: string[] = [
  // Migration 1: Create users table
  `
  CREATE TABLE IF NOT EXISTS users (
    discord_id VARCHAR(20) PRIMARY KEY,
    steam_id VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(100),
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Migration 2: Create matches table
  `
  CREATE TABLE IF NOT EXISTS matches (
    match_id BIGINT PRIMARY KEY,
    discord_id VARCHAR(20) REFERENCES users(discord_id),
    hero_id INTEGER NOT NULL,
    result VARCHAR(10) NOT NULL,
    kills INTEGER,
    deaths INTEGER,
    assists INTEGER,
    gpm INTEGER,
    xpm INTEGER,
    net_worth INTEGER,
    duration INTEGER,
    played_at TIMESTAMP NOT NULL,
    analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Migration 3: Create server leaderboards table
  `
  CREATE TABLE IF NOT EXISTS server_stats (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL,
    discord_id VARCHAR(20) REFERENCES users(discord_id),
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    avg_gpm INTEGER DEFAULT 0,
    avg_xpm INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, discord_id)
  );
  `,
  
  // Migration 4: Create indexes
  `
  CREATE INDEX IF NOT EXISTS idx_matches_discord_id ON matches(discord_id);
  CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild ON server_stats(guild_id);
  `,
  
  // Migration 5: Create guild settings table (language preferences)
  `
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id VARCHAR(20) PRIMARY KEY,
    locale VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Migration 6: Create LFG queue table (V2.0 Dashboard)
  `
  CREATE TABLE IF NOT EXISTS lfg_queue (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    role VARCHAR(20),
    skill_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(discord_id, guild_id)
  );
  `,
  
  // Migration 7: Create user socials table (V2.0 Content Hub)
  `
  CREATE TABLE IF NOT EXISTS user_socials (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(20) UNIQUE NOT NULL,
    twitch VARCHAR(255),
    youtube VARCHAR(255),
    twitter VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Migration 8: Create indexes for V2.0 tables
  `
  CREATE INDEX IF NOT EXISTS idx_lfg_queue_guild ON lfg_queue(guild_id);
  CREATE INDEX IF NOT EXISTS idx_lfg_queue_discord ON lfg_queue(discord_id);
  CREATE INDEX IF NOT EXISTS idx_user_socials_discord ON user_socials(discord_id);
  `,
];

async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      await pool.query(migrations[i]!);
      console.log(`✅ Migration ${i + 1} completed`);
    }
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void runMigrations();
}

export default runMigrations;
