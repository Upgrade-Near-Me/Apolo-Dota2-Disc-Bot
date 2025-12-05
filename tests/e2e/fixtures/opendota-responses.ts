/**
 * Mock OpenDota API REST Responses
 * Used for fallback when Stratz is rate limited or blocked
 */

// ✅ Happy Path: Player Profile
export const mockOpenDotaProfile = {
  account_id: 155431346, // 32-bit Steam ID
  personaname: 'Test Player',
  avatar: 'https://avatars.akamai.steamstatic.com/test.jpg',
  avatarmedium: 'https://avatars.akamai.steamstatic.com/test_medium.jpg',
  avatarfull: 'https://avatars.akamai.steamstatic.com/test_full.jpg',
  profileurl: 'https://steamcommunity.com/profiles/76561199115431346/',
  last_login: '2025-12-04T10:30:00Z',
  lp_rank: 7700, // MMR / 100
  rank_tier: 77, // Rank tier (Immortal)
  leaderboard_rank: 2500,
  is_contributor: false,
  is_subscriber: false,
};

// ✅ Happy Path: Recent Match
export const mockOpenDotaMatch = {
  match_id: 7847229421,
  account_id: 155431346,
  player_slot: 0,
  hero_id: 1, // Anti-Mage
  kills: 15,
  deaths: 3,
  assists: 8,
  gold_per_min: 542,
  xp_per_min: 612,
  last_hits: 486,
  denies: 12,
  duration: 2143,
  start_time: 1701667200,
  radiant_win: true,
  isRadiant: true,
  win: true,
  lose: false,
  lane: 1, // Safe lane
  lane_role: 1, // Carry
  is_roaming: false,
};

// ✅ Happy Path: Match History
export const mockOpenDotaMatches = [
  {
    match_id: 7847229421,
    account_id: 155431346,
    player_slot: 0,
    hero_id: 1,
    kills: 15,
    deaths: 3,
    assists: 8,
    gold_per_min: 542,
    xp_per_min: 612,
    duration: 2143,
    start_time: 1701667200,
    radiant_win: true,
    isRadiant: true,
    win: true,
  },
  {
    match_id: 7847229420,
    account_id: 155431346,
    player_slot: 4,
    hero_id: 5,
    kills: 3,
    deaths: 2,
    assists: 18,
    gold_per_min: 320,
    xp_per_min: 410,
    duration: 1890,
    start_time: 1701663600,
    radiant_win: false,
    isRadiant: false,
    win: false,
  },
];

// ✅ Happy Path: Public Match Data
export const mockOpenDotaPublicMatch = {
  match_id: 7847229421,
  match_seq_num: 4589234,
  radiant_win: true,
  start_time: 1701667200,
  duration: 2143,
  dire_team: {
    team_id: 0,
    team_name: 'Dire',
    complete: true,
  },
  radiant_team: {
    team_id: 0,
    team_name: 'Radiant',
    complete: true,
  },
  players: [
    {
      match_id: 7847229421,
      account_id: 155431346,
      player_slot: 0,
      team_slot: 0,
      hero_id: 1,
      kills: 15,
      deaths: 3,
      assists: 8,
      gold_per_min: 542,
      xp_per_min: 612,
    },
  ],
  radiant_gold_adv: [0, 500, 1200, 2000, 3500],
  radiant_xp_adv: [0, 800, 1800, 3200, 5000],
  radiant_team_complete: true,
  dire_team_complete: true,
};

// ✅ Happy Path: Hero Stats (Meta)
export const mockOpenDotaHeroStats = [
  {
    id: 1,
    name: 'anti_mage',
    localized_name: 'Anti-Mage',
    primary_attr: 'agi',
    attack_type: 'Melee',
    roles: ['Carry', 'Escape'],
    stats: {
      hp: 620,
      mana: 195,
      armor: 2.0,
      mana_regen: 0.65,
      attack_range: 150,
      missile_speed: 0,
      attack_duration: 0.3,
      base_attack_time: 1.5,
      attack_point: 0.3,
      move_speed: 310,
    },
  },
  {
    id: 2,
    name: 'axe',
    localized_name: 'Axe',
    primary_attr: 'str',
    attack_type: 'Melee',
    roles: ['Initiator', 'Durable', 'Disabler'],
    stats: {
      hp: 650,
      mana: 0,
      armor: 1.0,
      mana_regen: 0.0,
      attack_range: 150,
      missile_speed: 0,
      attack_duration: 0.3,
      base_attack_time: 1.7,
      attack_point: 0.3,
      move_speed: 310,
    },
  },
];

// ❌ Error: 404 Not Found (private profile)
export const mockOpenDotaNotFound = {
  error: 'Not Found',
  status: 404,
};

// ❌ Error: Server Error (500)
export const mockOpenDotaServerError = {
  error: 'Internal Server Error',
  status: 500,
};

// ❌ Error: Rate Limited (429)
export const mockOpenDotaRateLimit = {
  error: 'Too Many Requests',
  status: 429,
  retry_after: 60,
};

// ❌ Error: Unauthorized (401)
export const mockOpenDotaUnauthorized = {
  error: 'Unauthorized',
  status: 401,
};

// 🧪 Edge Case: New account (0 matches)
export const mockOpenDotaNewAccount = {
  ...mockOpenDotaProfile,
  account_id: 999999999,
  lp_rank: 0,
  rank_tier: null,
  leaderboard_rank: null,
};

// 🧪 Edge Case: Private profile (no public data)
export const mockOpenDotaPrivateProfile = {
  account_id: 888888888,
  personaname: 'Private User',
  profile: 0, // No profile data
  lp_rank: null,
  rank_tier: null,
};

// 🧪 Edge Case: Abandoned player (no recent activity)
export const mockOpenDotaAbandonedAccount = {
  ...mockOpenDotaProfile,
  account_id: 777777777,
  personaname: 'Inactive Player',
  last_login: '2022-01-01T00:00:00Z', // 3 years old
};

/**
 * REST Endpoint Templates (for reference)
 */

export const openDotaEndpoints = {
  // Get player by ID
  getPlayer: (accountId: number) =>
    `https://api.opendota.com/api/players/${accountId}`,

  // Get player matches
  getMatches: (accountId: number, limit = 20) =>
    `https://api.opendota.com/api/players/${accountId}/matches?limit=${limit}`,

  // Get public match
  getMatch: (matchId: number) =>
    `https://api.opendota.com/api/matches/${matchId}`,

  // Get hero stats
  getHeroStats: () => 'https://api.opendota.com/api/heroStats',

  // Get hero constants
  getHeroes: () => 'https://api.opendota.com/api/constants/heroes',

  // Get items
  getItems: () => 'https://api.opendota.com/api/constants/items',
};

export default {
  mockOpenDotaProfile,
  mockOpenDotaMatch,
  mockOpenDotaMatches,
  mockOpenDotaPublicMatch,
  mockOpenDotaHeroStats,
  mockOpenDotaNotFound,
  mockOpenDotaServerError,
  mockOpenDotaRateLimit,
  mockOpenDotaUnauthorized,
  mockOpenDotaNewAccount,
  mockOpenDotaPrivateProfile,
  mockOpenDotaAbandonedAccount,
};
