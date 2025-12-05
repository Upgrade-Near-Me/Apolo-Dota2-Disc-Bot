/**
 * Mock Stratz API GraphQL Responses
 * Real response structures for testing
 */

// ✅ Happy Path: Player Profile with MMR
export const mockStratzPlayerProfile = {
  data: {
    steamAccount: {
      id: '115431346',
      name: 'Test Player',
      avatar:
        'https://avatars.akamai.steamstatic.com/test.jpg',
    },
    matchCount: 450,
    winCount: 235,
    stats: {
      ['1']: { wins: 25, matches: 45 }, // Carry
      ['2']: { wins: 20, matches: 40 }, // Mid
      ['3']: { wins: 18, matches: 35 }, // Offlane
      ['4']: { wins: 95, matches: 120 }, // Pos4 Support
      ['5']: { wins: 77, matches: 115 }, // Pos5 Support
    },
  },
};

// ✅ Happy Path: Player Rank (MMR)
export const mockStratzPlayerRank = {
  data: {
    player: {
      steamAccount: {
        id: '115431346',
      },
      rank: {
        rankTier: 77, // Immortal (7 stars)
        leaderboardRank: 2500,
      },
    },
  },
};

// ✅ Happy Path: Match Details
export const mockStratzMatch = {
  data: {
    match: {
      id: '7847229421',
      durationSeconds: 2143,
      radiantWin: true,
      players: [
        {
          steamAccountId: '115431346',
          heroId: 1, // Anti-Mage
          kills: 15,
          deaths: 3,
          assists: 8,
          goldPerMinute: 542,
          experiencePerMinute: 612,
          netWorth: 28500,
          itemIds: [1, 2, 3, 4, 5, 6],
          stats: {
            heroDamage: 45000,
            heroHealing: 2000,
            towerDamage: 5600,
          },
        },
      ],
    },
  },
};

// ✅ Happy Path: Recent Matches
export const mockStratzMatches = {
  data: {
    player: {
      matches: [
        {
          id: '7847229421',
          durationSeconds: 2143,
          startDateTime: 1701667200,
          isRadiant: true,
          didRadiantWin: true,
          playbackData: null,
          stats: {
            kills: 15,
            deaths: 3,
            assists: 8,
            goldPerMinute: 542,
            experiencePerMinute: 612,
          },
        },
        {
          id: '7847229420',
          durationSeconds: 1890,
          startDateTime: 1701663600,
          isRadiant: false,
          didRadiantWin: false,
          playbackData: null,
          stats: {
            kills: 8,
            deaths: 5,
            assists: 12,
            goldPerMinute: 420,
            experiencePerMinute: 480,
          },
        },
      ],
    },
  },
};

// ✅ Happy Path: Hero Stats (Meta)
export const mockStratzHeroStats = {
  data: {
    heroStats: [
      {
        heroId: 1, // Anti-Mage
        displayName: 'Anti-Mage',
        stats: {
          matchCount: 5000,
          wins: 2650,
          pickRate: 0.125,
          banRate: 0.05,
          winRate: 0.53,
        },
      },
      {
        heroId: 2, // Axe
        displayName: 'Axe',
        stats: {
          matchCount: 4800,
          wins: 2400,
          pickRate: 0.11,
          banRate: 0.08,
          winRate: 0.5,
        },
      },
    ],
  },
};

// ✅ Happy Path: Empty matches (newly created account)
export const mockStratzNoMatches = {
  data: {
    player: {
      matches: [],
    },
  },
};

// ❌ Error: Rate Limit (429 equivalent in GraphQL)
export const mockStratzRateLimit = {
  errors: [
    {
      message: 'Too many requests',
      extensions: {
        code: 'RATE_LIMITED',
        retryAfter: 60,
      },
    },
  ],
};

// ❌ Error: Invalid Query
export const mockStratzInvalidQuery = {
  errors: [
    {
      message: 'Cannot query field "invalidField" on type "Query".',
      locations: [{ line: 2, column: 3 }],
    },
  ],
};

// ❌ Error: Unauthorized (Invalid token)
export const mockStratzUnauthorized = {
  errors: [
    {
      message: 'Unauthorized',
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    },
  ],
};

// ❌ Error: Server Error (500)
export const mockStratzServerError = {
  errors: [
    {
      message: 'Internal server error',
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
  ],
};

// ❌ Error: Player Not Found
export const mockStratzPlayerNotFound = {
  data: {
    player: null,
  },
};

// ❌ Error: Private Profile
export const mockStratzPrivateProfile = {
  data: {
    steamAccount: {
      id: '999999999',
      name: 'Private User',
      avatar: null,
      isProfilePublic: false,
    },
  },
};

// 🔄 Fallback: Partial data available
export const mockStratzPartialData = {
  data: {
    player: {
      matches: [
        {
          id: '7847229421',
          durationSeconds: 2143,
          startDateTime: 1701667200,
          isRadiant: true,
          didRadiantWin: true,
          playbackData: null,
          stats: {
            kills: 15,
            deaths: 3,
            assists: 8,
            // Missing GPM/XPM - partial data
          },
        },
      ],
    },
  },
};

// 🧪 Edge Case: Extreme MMR (above 12000)
export const mockStratzExtremeMMR = {
  data: {
    player: {
      steamAccount: {
        id: '115431346',
      },
      rank: {
        rankTier: 80, // 12k+ Immortal
        leaderboardRank: 1,
      },
    },
  },
};

// 🧪 Edge Case: Herald rank (lowest)
export const mockStratzHeraldRank = {
  data: {
    player: {
      steamAccount: {
        id: '999999999',
      },
      rank: {
        rankTier: 11, // Herald 1
        leaderboardRank: null,
      },
    },
  },
};

// 🧪 Edge Case: Unranked (no MMR)
export const mockStratzUnranked = {
  data: {
    player: {
      steamAccount: {
        id: '888888888',
      },
      rank: null,
    },
  },
};

// 🧪 Edge Case: 1M+ matches (retired pro)
export const mockStratzVeteranPlayer = {
  data: {
    player: {
      matchCount: 1200000,
      winCount: 640000,
      stats: {
        ['1']: { wins: 160000, matches: 250000 },
        ['2']: { wins: 160000, matches: 250000 },
        ['3']: { wins: 160000, matches: 250000 },
        ['4']: { wins: 160000, matches: 250000 },
        ['5']: { wins: 0, matches: 200000 },
      },
    },
  },
};

/**
 * GraphQL Query Templates (for reference)
 * These show the exact structure Stratz expects
 */

export const stratzQueries = {
  // Get player profile
  playerProfile: `
    query GetPlayer($steamId: Long!) {
      player(steamAccountId: $steamId) {
        steamAccount { id name avatar }
        matchCount
        winCount
        stats {
          position1 { wins matches }
          position2 { wins matches }
          position3 { wins matches }
          position4 { wins matches }
          position5 { wins matches }
        }
      }
    }
  `,

  // Get rank
  playerRank: `
    query GetRank($steamId: Long!) {
      player(steamAccountId: $steamId) {
        rank { rankTier leaderboardRank }
      }
    }
  `,

  // Get recent matches
  recentMatches: `
    query GetMatches($steamId: Long!, $limit: Int) {
      player(steamAccountId: $steamId) {
        matches(first: $limit) {
          id
          durationSeconds
          startDateTime
          isRadiant
          didRadiantWin
          stats { kills deaths assists gpm xpm }
        }
      }
    }
  `,

  // Get match details
  matchDetails: `
    query GetMatch($matchId: Long!) {
      match(id: $matchId) {
        id
        durationSeconds
        radiantWin
        players {
          steamAccountId
          heroId
          kills deaths assists
          goldPerMinute experiencePerMinute
          netWorth
          itemIds
          stats { heroDamage heroHealing towerDamage }
        }
      }
    }
  `,

  // Get hero meta
  heroStats: `
    query GetHeroStats {
      heroStats {
        heroId
        displayName
        stats {
          matchCount
          wins
          pickRate
          banRate
          winRate
        }
      }
    }
  `,
};

export default {
  mockStratzPlayerProfile,
  mockStratzPlayerRank,
  mockStratzMatch,
  mockStratzMatches,
  mockStratzHeroStats,
  mockStratzNoMatches,
  mockStratzRateLimit,
  mockStratzInvalidQuery,
  mockStratzUnauthorized,
  mockStratzServerError,
  mockStratzPlayerNotFound,
  mockStratzPrivateProfile,
  mockStratzPartialData,
  mockStratzExtremeMMR,
  mockStratzHeraldRank,
  mockStratzUnranked,
  mockStratzVeteranPlayer,
};
