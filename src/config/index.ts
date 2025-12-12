import 'dotenv/config';
import logger from '../utils/logger.js';
import { getApiKey } from '../utils/apiKeyPool.js';

interface Config {
  discord: {
    token: string;
    clientId: string;
    guildId?: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  api: {
    stratz: {
      token: string | null;
      endpoint: string;
    };
    steam: {
      apiKey: string;
      endpoint: string;
    };
    gemini: {
      apiKey: string | null;
      model: string;
      maxTokens: number;
      temperature: number;
    };
  };
  performanceTarget: number;
}

const config: Config = {
  discord: {
    token: process.env.DISCORD_TOKEN as string,
    clientId: process.env.DISCORD_CLIENT_ID as string,
    guildId: process.env.DISCORD_GUILD_ID,
  },
  database: {
    url: process.env.DATABASE_URL as string,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  api: {
    stratz: {
      token: getApiKey('stratz') || process.env.STRATZ_API_TOKEN_1 || '',
      endpoint: 'https://api.stratz.com/graphql',
    },
    steam: {
      apiKey: process.env.STEAM_API_KEY as string,
      endpoint: 'https://api.steampowered.com',
    },
    gemini: {
      apiKey: getApiKey('gemini') || process.env.GEMINI_API_KEY_1 || '',
      model: 'gemini-2.0-flash-exp',
      maxTokens: 1000,
      temperature: 0.7,
    },
  },
  performanceTarget: 2500,
};

const requiredEnv = [
  ['DISCORD_TOKEN', config.discord.token],
  ['DISCORD_CLIENT_ID', config.discord.clientId],
  ['DATABASE_URL', config.database.url],
];

for (const [name, value] of requiredEnv) {
  if (!value) {
    logger.fatal({ envVar: name }, 'Missing required environment variable');
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export default config;
