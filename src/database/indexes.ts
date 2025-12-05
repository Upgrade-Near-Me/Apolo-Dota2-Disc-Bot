/**
 * PHASE 14: Index Definitions
 * 
 * Comprehensive index strategy for PostgreSQL optimization
 * - Composite indexes for common query patterns
 * - BRIN indexes for large sequential tables
 * - Partial indexes for frequent filters
 * - Index statistics and monitoring
 * 
 * Duration: ~30 minutes
 * Status: Phase 14.1 (Index Design)
 */

export interface IndexDefinition {
  name: string;                    // Unique index name
  table: string;                   // Table name
  columns: string[];               // Column names (can include DESC)
  type: 'BTREE' | 'BRIN' | 'GiST' | 'GIN';  // Index type
  partial?: string;                // WHERE condition for partial index
  unique?: boolean;                // UNIQUE constraint
  concurrent?: boolean;            // Create CONCURRENTLY
  description: string;             // Why this index
  expectedImprovment: string;      // Query improvement
}

/**
 * Server Stats Indexes (Leaderboard Queries)
 * 
 * Table: server_stats (50K rows)
 * Primary queries: Leaderboard sorting, player stats lookup
 */
export const serverStatsIndexes: IndexDefinition[] = [
  {
    name: 'idx_server_stats_guild_gpm',
    table: 'server_stats',
    columns: ['guild_id', 'avg_gpm DESC'],
    type: 'BTREE',
    partial: 'total_matches >= 5',
    description: 'Leaderboard query: SELECT * WHERE guild_id ORDER BY avg_gpm DESC',
    expectedImprovment: '500ms → 30ms (16x faster)',
  },
  {
    name: 'idx_server_stats_guild_xpm',
    table: 'server_stats',
    columns: ['guild_id', 'avg_xpm DESC'],
    type: 'BTREE',
    partial: 'total_matches >= 5',
    description: 'Alt leaderboard: SELECT * WHERE guild_id ORDER BY avg_xpm DESC',
    expectedImprovment: '500ms → 30ms (16x faster)',
  },
  {
    name: 'idx_server_stats_guild_streak',
    table: 'server_stats',
    columns: ['guild_id', 'win_streak DESC'],
    type: 'BTREE',
    description: 'Win streak leaderboard: ORDER BY win_streak DESC',
    expectedImprovment: '800ms → 40ms (20x faster)',
  },
  {
    name: 'idx_server_stats_discord_id',
    table: 'server_stats',
    columns: ['discord_id'],
    type: 'BTREE',
    description: 'Player lookup across servers: WHERE discord_id = ?',
    expectedImprovment: '1000ms → 50ms (20x faster)',
  },
];

/**
 * Matches Indexes (Match History & Analytics)
 * 
 * Table: matches (1M+ rows, growing daily)
 * Primary queries: Recent matches, hero analytics, match lookup
 */
export const matchesIndexes: IndexDefinition[] = [
  {
    name: 'idx_matches_discord_played_at',
    table: 'matches',
    columns: ['discord_id', 'played_at DESC'],
    type: 'BTREE',
    description: 'Match history: SELECT * WHERE discord_id ORDER BY played_at DESC',
    expectedImprovment: '2000ms → 50ms (40x faster)',
  },
  {
    name: 'idx_matches_match_id',
    table: 'matches',
    columns: ['match_id'],
    type: 'BTREE',
    unique: true,
    description: 'Match lookup: SELECT * WHERE match_id = ?',
    expectedImprovment: '500ms → 5ms (100x faster)',
  },
  {
    name: 'idx_matches_played_at_brin',
    table: 'matches',
    columns: ['played_at'],
    type: 'BRIN',
    description: 'Time-range queries: WHERE played_at > ? (for 1M rows)',
    expectedImprovment: '3000ms → 200ms (15x faster)',
  },
  {
    name: 'idx_matches_hero_discord',
    table: 'matches',
    columns: ['hero_id', 'discord_id'],
    type: 'BTREE',
    partial: 'result = true',
    description: 'Best heroes: SELECT * WHERE hero_id AND discord_id AND result = true',
    expectedImprovment: '1500ms → 50ms (30x faster)',
  },
  {
    name: 'idx_matches_hero_winrate',
    table: 'matches',
    columns: ['hero_id', 'result'],
    type: 'BTREE',
    description: 'Hero win rate: GROUP BY hero_id, result',
    expectedImprovment: '2000ms → 100ms (20x faster)',
  },
];

/**
 * Users Indexes (Profile & Connection)
 * 
 * Table: users (1M+ rows)
 * Primary queries: Steam ID lookup, Discord ID lookup
 */
export const usersIndexes: IndexDefinition[] = [
  {
    name: 'idx_users_steam_id',
    table: 'users',
    columns: ['steam_id'],
    type: 'BTREE',
    unique: true,
    description: 'Profile lookup: SELECT * WHERE steam_id = ?',
    expectedImprovment: '300ms → 5ms (60x faster)',
  },
  {
    name: 'idx_users_discord_id',
    table: 'users',
    columns: ['discord_id'],
    type: 'BTREE',
    unique: true,
    description: 'Discord lookup: SELECT * WHERE discord_id = ?',
    expectedImprovment: '300ms → 5ms (60x faster)',
  },
];

/**
 * Guild Settings Indexes (Server Configuration)
 * 
 * Table: guild_settings (50K rows)
 * Primary queries: Language preference, server settings
 */
export const guildSettingsIndexes: IndexDefinition[] = [
  {
    name: 'idx_guild_settings_locale',
    table: 'guild_settings',
    columns: ['locale'],
    type: 'BTREE',
    description: 'Locale lookup: SELECT * WHERE locale = ?',
    expectedImprovment: '100ms → 5ms (20x faster)',
  },
];

/**
 * Composite indexes combining all tables
 * These are created after individual indexes for optimal planning
 */
export const compositeIndexes: IndexDefinition[] = [
  {
    name: 'idx_server_stats_guild_discord_gpm',
    table: 'server_stats',
    columns: ['guild_id', 'discord_id', 'avg_gpm'],
    type: 'BTREE',
    description: 'Covering index for full leaderboard queries (index-only scans)',
    expectedImprovment: '500ms → 20ms (25x faster, no table lookups)',
  },
];

/**
 * All indexes combined
 */
export const allIndexes: IndexDefinition[] = [
  ...serverStatsIndexes,
  ...matchesIndexes,
  ...usersIndexes,
  ...guildSettingsIndexes,
  ...compositeIndexes,
];

/**
 * Export by priority for staged creation
 */
export const indexPriority = {
  // Phase 1: High impact, create immediately (HIGHEST PRIORITY)
  immediate: [
    allIndexes.find((i) => i.name === 'idx_server_stats_guild_gpm')!,
    allIndexes.find((i) => i.name === 'idx_matches_discord_played_at')!,
    allIndexes.find((i) => i.name === 'idx_users_steam_id')!,
  ],

  // Phase 2: Medium priority (AFTER BASELINE TESTS)
  medium: [
    allIndexes.find((i) => i.name === 'idx_matches_match_id')!,
    allIndexes.find((i) => i.name === 'idx_server_stats_guild_xpm')!,
    allIndexes.find((i) => i.name === 'idx_server_stats_discord_id')!,
  ],

  // Phase 3: Lower priority, analytical queries (CAN WAIT)
  analytical: [
    allIndexes.find((i) => i.name === 'idx_matches_played_at_brin')!,
    allIndexes.find((i) => i.name === 'idx_matches_hero_discord')!,
    allIndexes.find((i) => i.name === 'idx_guild_settings_locale')!,
  ],

  // Phase 4: Covering indexes for optimization (AFTER STATS COLLECTION)
  covering: [allIndexes.find((i) => i.name === 'idx_server_stats_guild_discord_gpm')!],
};

/**
 * Display index summary
 */
export function displayIndexSummary(): string {
  const total = allIndexes.length;
  const btree = allIndexes.filter((i) => i.type === 'BTREE').length;
  const brin = allIndexes.filter((i) => i.type === 'BRIN').length;
  const partial = allIndexes.filter((i) => i.partial).length;

  return `
╔═══════════════════════════════════════════╗
║     DATABASE INDEX STRATEGY SUMMARY       ║
╚═══════════════════════════════════════════╝

📊 INDEX COUNT
   Total Indexes:       ${total}
   BTREE:               ${btree}
   BRIN:                ${brin}
   Partial Indexes:     ${partial}

📈 BY TABLE
   server_stats:        ${serverStatsIndexes.length} indexes
   matches:             ${matchesIndexes.length} indexes
   users:               ${usersIndexes.length} indexes
   guild_settings:      ${guildSettingsIndexes.length} indexes
   composite:           ${compositeIndexes.length} indexes

🎯 CREATION PRIORITY
   Phase 1 (Immediate):    ${indexPriority.immediate.length} indexes
   Phase 2 (Medium):       ${indexPriority.medium.length} indexes
   Phase 3 (Analytical):   ${indexPriority.analytical.length} indexes
   Phase 4 (Covering):     ${indexPriority.covering.length} indexes

═══════════════════════════════════════════
  `.trim();
}

/**
 * Validate index definitions
 */
export function validateIndexes(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenNames = new Set<string>();

  for (const idx of allIndexes) {
    if (!idx.name) errors.push('Index missing name');
    if (!idx.table) errors.push(`${idx.name}: missing table`);
    if (!idx.columns || idx.columns.length === 0) errors.push(`${idx.name}: no columns`);
    if (!['BTREE', 'BRIN', 'GiST', 'GIN'].includes(idx.type)) {
      errors.push(`${idx.name}: invalid type ${idx.type}`);
    }

    // Check for duplicate names
    if (seenNames.has(idx.name)) {
      errors.push(`${idx.name}: duplicate name`);
    }
    seenNames.add(idx.name);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  allIndexes,
  serverStatsIndexes,
  matchesIndexes,
  usersIndexes,
  guildSettingsIndexes,
  compositeIndexes,
  indexPriority,
  displayIndexSummary,
  validateIndexes,
};
