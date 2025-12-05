/**
 * Mock Steam Web API Responses
 * Used for player metadata, avatars, and profile links
 */

// ✅ Happy Path: Player Summary
export const mockSteamPlayerSummary = {
  response: {
    players: [
      {
        steamid: '76561199115431346',
        communityvisibilitystate: 3, // Public
        profilestate: 1,
        personaname: 'Test Player',
        profileurl: 'https://steamcommunity.com/profiles/76561199115431346/',
        avatar: 'https://avatars.akamai.steamstatic.com/test.jpg',
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/test_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/test_full.jpg',
        personastate: 1,
        realname: 'John Doe',
        primaryclanid: '103582791429521408',
        timecreated: 1451431346,
        loccountrycode: 'US',
        loccstatecode: 'CA',
        loccityid: 3673462,
        lastlogoff: 1701667200,
      },
    ],
  },
};

// ✅ Happy Path: Multiple Players
export const mockSteamMultiplePlayers = {
  response: {
    players: [
      {
        steamid: '76561199115431346',
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: 'Player 1',
        profileurl:
          'https://steamcommunity.com/profiles/76561199115431346/',
        avatar: 'https://avatars.akamai.steamstatic.com/player1.jpg',
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/player1_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/player1_full.jpg',
        personastate: 1,
        lastlogoff: 1701667200,
      },
      {
        steamid: '76561199215431347',
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: 'Player 2',
        profileurl:
          'https://steamcommunity.com/profiles/76561199215431347/',
        avatar: 'https://avatars.akamai.steamstatic.com/player2.jpg',
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/player2_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/player2_full.jpg',
        personastate: 1,
        lastlogoff: 1701654800,
      },
    ],
  },
};

// ✅ Happy Path: Player without real name
export const mockSteamPlayerNoRealname = {
  response: {
    players: [
      {
        steamid: '76561199115431346',
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: 'Anonymous Player',
        profileurl:
          'https://steamcommunity.com/profiles/76561199115431346/',
        avatar: 'https://avatars.akamai.steamstatic.com/test.jpg',
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/test_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/test_full.jpg',
        personastate: 0, // Offline
        lastlogoff: 1701667200,
      },
    ],
  },
};

// ❌ Error: Private Profile
export const mockSteamPrivateProfile = {
  response: {
    players: [
      {
        steamid: '76561199999999999',
        communityvisibilitystate: 1, // Private
        profilestate: 1,
        personaname: 'Private User',
        profileurl:
          'https://steamcommunity.com/profiles/76561199999999999/',
        avatar:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg', // Default avatar
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        lastlogoff: 1701667200,
        // Missing personastate, realname (private fields)
      },
    ],
  },
};

// ❌ Error: User Not Found
export const mockSteamUserNotFound = {
  response: {
    players: [], // Empty array = not found
  },
};

// ❌ Error: Invalid API Key
export const mockSteamInvalidKey = {
  response: {
    players: [],
  },
};

// ❌ Error: Rate Limit
export const mockSteamRateLimit = {
  error: 'Too Many Requests',
  statusCode: 429,
};

// ❌ Error: Server Error
export const mockSteamServerError = {
  error: 'Internal Server Error',
  statusCode: 500,
};

// 🧪 Edge Case: Account disabled
export const mockSteamDisabledAccount = {
  response: {
    players: [
      {
        steamid: '76561199888888888',
        communityvisibilitystate: 0, // Not visible
        profilestate: 0, // No profile
        personaname: '[Removed]',
        profileurl:
          'https://steamcommunity.com/profiles/76561199888888888/',
        avatar: 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg',
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
      },
    ],
  },
};

// 🧪 Edge Case: Brand new account
export const mockSteamNewAccount = {
  response: {
    players: [
      {
        steamid: '76561199111111111',
        communityvisibilitystate: 3,
        profilestate: 0, // No profile set up yet
        personaname: 'New Player',
        profileurl:
          'https://steamcommunity.com/profiles/76561199111111111/',
        avatar: 'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg', // Default
        avatarmedium:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg',
        avatarfull:
          'https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        timecreated: 1701667200, // Created today
      },
    ],
  },
};

/**
 * Steam Web API Endpoints (for reference)
 */

export const steamEndpoints = {
  // Get player summaries
  getPlayerSummaries: (steamIds: string[], apiKey: string) =>
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamIds.join(',')}`,

  // Get friend list
  getFriendList: (steamId: string, apiKey: string) =>
    `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamId}`,

  // Get user groups
  getUserGroupList: (steamId: string) =>
    `https://api.steampowered.com/ISteamUser/GetUserGroupList/v1/?steamid=${steamId}`,

  // Get player bans
  getPlayerBans: (steamIds: string[], apiKey: string) =>
    `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamIds.join(',')}`,
};

/**
 * Steam ID Conversion Helpers
 */

export const steamIdConversion = {
  // Convert 64-bit to 32-bit
  to32bit: (steamId64: string): number => {
    const id64 = BigInt(steamId64);
    const universe = id64 >> 52n;
    const account = id64 & 0xffffffffn;
    return Number(account);
  },

  // Convert 32-bit to 64-bit
  to64bit: (steamId32: number): string => {
    const account = BigInt(steamId32);
    const universe = 0x0110000100000000n;
    return (universe | account).toString();
  },

  // Extract account ID from URL
  fromUrl: (profileUrl: string): number => {
    const match = profileUrl.match(
      /(?:profiles|gid)\/(\d+)/
    );
    return match ? parseInt(match[1], 10) : 0;
  },
};

export default {
  mockSteamPlayerSummary,
  mockSteamMultiplePlayers,
  mockSteamPlayerNoRealname,
  mockSteamPrivateProfile,
  mockSteamUserNotFound,
  mockSteamInvalidKey,
  mockSteamRateLimit,
  mockSteamServerError,
  mockSteamDisabledAccount,
  mockSteamNewAccount,
};
