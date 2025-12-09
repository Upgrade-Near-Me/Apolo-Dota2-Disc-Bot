import pkg from 'pg';
const { Pool } = pkg;

// Create a simple pool ONLY for migrations (no logger dependencies)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Only one connection needed for migrations
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

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

  // Migration 9: IMP score, match awards, and leveling/XP tables
  `
  CREATE TABLE IF NOT EXISTS match_imp_scores (
    id SERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    discord_id VARCHAR(20) NOT NULL,
    steam_id VARCHAR(32) NOT NULL,
    hero_id INT NOT NULL,
    imp_score DECIMAL(6,2) NOT NULL,
    rank_tier INT DEFAULT 0,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, steam_id),
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
  );

  CREATE INDEX IF NOT EXISTS idx_imp_discord ON match_imp_scores(discord_id);
  CREATE INDEX IF NOT EXISTS idx_imp_score ON match_imp_scores(imp_score DESC);
  CREATE INDEX IF NOT EXISTS idx_imp_match ON match_imp_scores(match_id);

  CREATE TABLE IF NOT EXISTS user_xp (
    discord_id VARCHAR(20) PRIMARY KEY,
    xp BIGINT DEFAULT 0,
    level INT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS xp_events (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(20) NOT NULL,
    source VARCHAR(32) NOT NULL,
    delta INT NOT NULL,
    xp_after BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
  );

  CREATE INDEX IF NOT EXISTS idx_xp_events_discord ON xp_events(discord_id);

  CREATE TABLE IF NOT EXISTS match_awards (
    id SERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    discord_id VARCHAR(20) NOT NULL,
    steam_id VARCHAR(32) NOT NULL,
    award_keys TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, steam_id),
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
  );

  CREATE INDEX IF NOT EXISTS idx_awards_discord ON match_awards(discord_id);
  `,

  // Migration 10: Performance indexes (Phase 14)
  `
  -- server_stats leaderboard indexes
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild_matches ON server_stats(guild_id, matches_played DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild_wins ON server_stats(guild_id, matches_won DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild_gpm ON server_stats(guild_id, avg_gpm DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild_xpm ON server_stats(guild_id, avg_xpm DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_guild_streak ON server_stats(guild_id, current_streak DESC);
  CREATE INDEX IF NOT EXISTS idx_server_stats_updated ON server_stats(updated_at DESC);

  -- match_imp_scores indexes
  CREATE INDEX IF NOT EXISTS idx_imp_steam ON match_imp_scores(steam_id);
  CREATE INDEX IF NOT EXISTS idx_imp_rank ON match_imp_scores(rank_tier DESC);
  CREATE INDEX IF NOT EXISTS idx_imp_calculated ON match_imp_scores(calculated_at DESC);

  -- match_awards indexes
  CREATE INDEX IF NOT EXISTS idx_awards_steam ON match_awards(steam_id);
  CREATE INDEX IF NOT EXISTS idx_awards_created ON match_awards(created_at DESC);

  -- user_xp indexes
  CREATE INDEX IF NOT EXISTS idx_user_xp_level ON user_xp(level DESC);
  CREATE INDEX IF NOT EXISTS idx_user_xp_updated ON user_xp(updated_at DESC);

  -- xp_events indexes
  CREATE INDEX IF NOT EXISTS idx_xp_events_source ON xp_events(source);
  CREATE INDEX IF NOT EXISTS idx_xp_events_created ON xp_events(created_at DESC);
  `,
];

async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`   Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'not set'}`);
  
  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`\n📝 Running migration ${i + 1}/${migrations.length}...`);
      await pool.query(migrations[i]!);
      console.log(`✅ Migration ${i + 1} completed`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Stack trace:', (error as Error).stack);
    throw error;
  } finally {
    console.log(`\n🔧 Cleanup: NODE_ENV=${process.env.NODE_ENV}, will ${process.env.NODE_ENV === 'test' ? 'NOT' : ''} close pool`);
    // Only close pool in production/staging, keep it open for tests
    if (process.env.NODE_ENV !== 'test') {
      await pool.end();
      console.log('✅ Pool closed');
    } else {
      console.log('✅ Pool kept open for tests');
    }
  }
}

// Run migrations if executed directly (works in all environments)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1]);
if (isMainModule || process.argv.includes('migrate.ts') || process.argv.includes('migrate.js')) {
  void runMigrations();
}

export default runMigrations;
