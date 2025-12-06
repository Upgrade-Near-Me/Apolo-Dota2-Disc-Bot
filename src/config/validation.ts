/**
 * Environment Variable Validation
 * 
 * Validates all environment variables at startup.
 * Provides friendly error messages if variables are missing or invalid.
 * 
 * Usage:
 *   import { validateEnv } from './config/validation.js';
 *   const env = validateEnv();
 *   console.log(env.discordToken);
 */

/**
 * Validated environment configuration
 */
export interface EnvConfig {
  discordToken: string;
  discordClientId: string;
  discordGuildId?: string;
  databaseUrl: string;
  redisHost: string;
  redisPort: number;
  stratzApiToken?: string;
  steamApiKey?: string;
  geminiApiKey?: string;
  nodeEnv: 'development' | 'production';
}

/**
 * Validate environment variables at startup
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  const discordToken = process.env.DISCORD_TOKEN;
  if (!discordToken) {
    errors.push('DISCORD_TOKEN is required (Discord bot token from Developer Portal)');
  }
  
  const discordClientId = process.env.DISCORD_CLIENT_ID;
  if (!discordClientId) {
    errors.push('DISCORD_CLIENT_ID is required (Discord application ID)');
  }
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL is required (PostgreSQL connection string)');
  } else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    errors.push('DATABASE_URL must start with postgresql:// or postgres://');
  }
  
  // Optional but recommended
  const stratzApiToken = process.env.STRATZ_API_TOKEN;
  const steamApiKey = process.env.STEAM_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  // Redis configuration with defaults
  const redisHost = process.env.REDIS_HOST || 'redis';
  const redisPortStr = process.env.REDIS_PORT || '6379';
  const redisPort = parseInt(redisPortStr, 10);
  
  if (isNaN(redisPort) || redisPort < 0 || redisPort > 65535) {
    errors.push('REDIS_PORT must be a valid port number (0-65535)');
  }
  
  // Optional guild ID for development
  const discordGuildId = process.env.DISCORD_GUILD_ID;
  
  // Environment mode
  const nodeEnv = (process.env.NODE_ENV || 'production') as 'development' | 'production';
  
  // Report errors
  if (errors.length > 0) {
    console.error('\n❌ Environment Configuration Error\n');
    errors.forEach((err) => {
      console.error(`  • ${err}`);
    });
    
    console.error('\n📋 Required Variables:');
    console.error('  - DISCORD_TOKEN (bot token from Discord Developer Portal)');
    console.error('  - DISCORD_CLIENT_ID (application ID)');
    console.error('  - DATABASE_URL (postgresql://username:password@host:port/database)');
    
    console.error('\n🔑 Optional but Recommended:');
    console.error('  - STRATZ_API_TOKEN (from https://stratz.com/api)');
    console.error('  - STEAM_API_KEY (from https://steamcommunity.com/dev/apikey)');
    console.error('  - GEMINI_API_KEY (from https://aistudio.google.com/app/apikey)');
    
    console.error('\n⚙️  Optional Configuration:');
    console.error('  - REDIS_HOST (default: redis)');
    console.error('  - REDIS_PORT (default: 6379)');
    console.error('  - DISCORD_GUILD_ID (for instant command deployment)');
    console.error('  - NODE_ENV (development or production)');
    
    console.error('\nℹ️  See SETUP.md for detailed instructions\n');
    
    process.exit(1);
  }
  
  // Log validation success
  console.log('✅ Environment variables validated successfully');
  
  // Cast to non-null since we validated above
  return {
    discordToken: discordToken!,
    discordClientId: discordClientId!,
    discordGuildId,
    databaseUrl: databaseUrl!,
    redisHost,
    redisPort,
    stratzApiToken,
    steamApiKey,
    geminiApiKey,
    nodeEnv,
  };
}

/**
 * Validated configuration instance
 * Safe to use across entire application
 */
export const envConfig = validateEnv();

// Re-export for convenience
export const {
  discordToken: DISCORD_TOKEN,
  discordClientId: DISCORD_CLIENT_ID,
  discordGuildId: DISCORD_GUILD_ID,
  databaseUrl: DATABASE_URL,
  redisHost: REDIS_HOST,
  redisPort: REDIS_PORT,
  stratzApiToken: STRATZ_API_TOKEN,
  steamApiKey: STEAM_API_KEY,
  geminiApiKey: GEMINI_API_KEY,
  nodeEnv: NODE_ENV,
} = envConfig;
