/**
 * PHASE 13: Redis Optimization Configuration
 * 
 * Enterprise-grade Redis configuration for 1M concurrent users
 * - Connection pooling via ioredis
 * - Key expiry policies (hot/warm/cold tiers)
 * - Memory management strategies
 * - Cluster and Sentinel support
 * 
 * Duration: ~30 minutes
 * Status: Phase 13.1 (Connection Pooling Setup)
 */

export interface RedisOptimizationConfig {
  // Connection pooling configuration
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  commandTimeout: number;

  // Memory management
  maxMemory: number;
  maxMemoryPolicy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-lfu' | 'volatile-lfu';

  // Key expiry (in seconds)
  ttl: {
    api: number;       // Hot cache: API responses (profiles, matches)
    session: number;   // Warm cache: session data, user preferences
    meta: number;      // Cold cache: hero data, meta info
  };

  // Health checking
  healthCheckInterval: number;
  healthCheckTimeout: number;

  // Cluster and failover
  enableCluster: boolean;
  enableSentinel: boolean;
  sentinelHosts?: Array<{ host: string; port: number }>;

  // Memory eviction
  evictionFraction: number;    // 0.1 = evict 10% when full
  reservedMemory: number;      // bytes reserved for overhead

  // Lua scripts
  enableLuaScripts: boolean;

  // Persistence
  enablePersistence: boolean;
  persistenceMode: 'rdb' | 'aof' | 'both';
}

/**
 * Development Configuration
 * - Smaller pools for testing
 * - Lower TTLs for fast iteration
 * - No clustering
 * - 128MB max memory
 */
export const developmentConfig: RedisOptimizationConfig = {
  minConnections: 5,
  maxConnections: 20,
  connectionTimeout: 5000,
  commandTimeout: 5000,

  maxMemory: 128 * 1024 * 1024,  // 128MB
  maxMemoryPolicy: 'allkeys-lru',

  ttl: {
    api: 300,         // 5 minutes
    session: 1800,    // 30 minutes
    meta: 3600,       // 1 hour
  },

  healthCheckInterval: 60000,    // 60 seconds
  healthCheckTimeout: 3000,      // 3 seconds

  enableCluster: false,
  enableSentinel: false,

  evictionFraction: 0.1,
  reservedMemory: 10 * 1024 * 1024,  // 10MB

  enableLuaScripts: true,
  enablePersistence: false,
  persistenceMode: 'rdb',
};

/**
 * Staging Configuration
 * - Medium pools for pre-production
 * - Standard TTLs
 * - Optional clustering
 * - 512MB max memory
 */
export const stagingConfig: RedisOptimizationConfig = {
  minConnections: 10,
  maxConnections: 40,
  connectionTimeout: 5000,
  commandTimeout: 5000,

  maxMemory: 512 * 1024 * 1024,  // 512MB
  maxMemoryPolicy: 'allkeys-lru',

  ttl: {
    api: 300,         // 5 minutes
    session: 1800,    // 30 minutes
    meta: 3600,       // 1 hour
  },

  healthCheckInterval: 30000,    // 30 seconds
  healthCheckTimeout: 3000,

  enableCluster: false,
  enableSentinel: true,

  evictionFraction: 0.1,
  reservedMemory: 20 * 1024 * 1024,  // 20MB

  enableLuaScripts: true,
  enablePersistence: true,
  persistenceMode: 'aof',
};

/**
 * Production Configuration
 * - Large pools for enterprise
 * - Optimized TTLs
 * - Full clustering with sentinel
 * - 1GB max memory (per instance)
 * 
 * For 1M concurrent users:
 * - 10,000 concurrent connections (at 0.1% peak)
 * - 100,000+ cache keys (10 keys per user average)
 * - ~200-400MB memory usage (depending on key sizes)
 * - 50+ connection pool handles spikes
 * - Automatic eviction prevents OOM
 */
export const productionConfig: RedisOptimizationConfig = {
  minConnections: 20,
  maxConnections: 100,
  connectionTimeout: 5000,
  commandTimeout: 5000,

  maxMemory: 1024 * 1024 * 1024,  // 1GB
  maxMemoryPolicy: 'allkeys-lru',  // LRU eviction for optimal performance

  ttl: {
    api: 300,         // 5 minutes (API responses)
    session: 1800,    // 30 minutes (user sessions)
    meta: 3600,       // 1 hour (meta data, static content)
  },

  healthCheckInterval: 15000,     // 15 seconds (aggressive)
  healthCheckTimeout: 3000,

  enableCluster: true,            // For horizontal scaling
  enableSentinel: true,           // For automatic failover
  sentinelHosts: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 },
  ],

  evictionFraction: 0.1,          // Evict 10% when reaching max
  reservedMemory: 50 * 1024 * 1024,  // 50MB reserved for overhead

  enableLuaScripts: true,
  enablePersistence: true,
  persistenceMode: 'aof',         // Append-only for data safety
};

/**
 * Get configuration based on environment
 */
export function getRedisConfig(): RedisOptimizationConfig {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
}

/**
 * Override configuration with environment variables
 */
export function getFinalRedisConfig(): RedisOptimizationConfig {
  const baseConfig = getRedisConfig();

  // Allow environment variable overrides
  if (process.env.REDIS_MAX_MEMORY) {
    baseConfig.maxMemory = parseInt(process.env.REDIS_MAX_MEMORY);
  }

  if (process.env.REDIS_MAX_CONNECTIONS) {
    baseConfig.maxConnections = parseInt(process.env.REDIS_MAX_CONNECTIONS);
  }

  if (process.env.REDIS_MIN_CONNECTIONS) {
    baseConfig.minConnections = parseInt(process.env.REDIS_MIN_CONNECTIONS);
  }

  if (process.env.REDIS_TTL_API) {
    baseConfig.ttl.api = parseInt(process.env.REDIS_TTL_API);
  }

  if (process.env.REDIS_TTL_SESSION) {
    baseConfig.ttl.session = parseInt(process.env.REDIS_TTL_SESSION);
  }

  if (process.env.REDIS_TTL_META) {
    baseConfig.ttl.meta = parseInt(process.env.REDIS_TTL_META);
  }

  return baseConfig;
}

/**
 * Validate configuration
 */
export function validateRedisConfig(config: RedisOptimizationConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.minConnections <= 0) {
    errors.push('minConnections must be > 0');
  }

  if (config.maxConnections < config.minConnections) {
    errors.push('maxConnections must be >= minConnections');
  }

  if (config.maxMemory < 10 * 1024 * 1024) {
    errors.push('maxMemory must be at least 10MB');
  }

  if (config.ttl.api <= 0 || config.ttl.session <= 0 || config.ttl.meta <= 0) {
    errors.push('All TTL values must be positive');
  }

  if (config.evictionFraction < 0 || config.evictionFraction > 1) {
    errors.push('evictionFraction must be between 0 and 1');
  }

  if (config.enableSentinel && (!config.sentinelHosts || config.sentinelHosts.length === 0)) {
    errors.push('sentinelHosts required when enableSentinel is true');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Display configuration summary
 */
export function displayConfigSummary(config: RedisOptimizationConfig): string {
  const env = process.env.NODE_ENV || 'development';

  return `
╔═══════════════════════════════════════════╗
║    REDIS OPTIMIZATION CONFIGURATION       ║
╚═══════════════════════════════════════════╝

📋 ENVIRONMENT: ${env.toUpperCase()}

🔌 CONNECTION POOLING
   Min Connections:     ${config.minConnections}
   Max Connections:     ${config.maxConnections}
   Connection Timeout:  ${config.connectionTimeout}ms
   Command Timeout:     ${config.commandTimeout}ms

💾 MEMORY MANAGEMENT
   Max Memory:          ${(config.maxMemory / 1024 / 1024).toFixed(0)}MB
   Eviction Policy:     ${config.maxMemoryPolicy}
   Eviction Fraction:   ${(config.evictionFraction * 100).toFixed(0)}%
   Reserved Memory:     ${(config.reservedMemory / 1024 / 1024).toFixed(0)}MB

⏱️  KEY EXPIRY (TTL)
   API Cache (Hot):     ${config.ttl.api}s (${(config.ttl.api / 60).toFixed(1)} min)
   Session (Warm):      ${config.ttl.session}s (${(config.ttl.session / 60).toFixed(1)} min)
   Meta (Cold):         ${config.ttl.meta}s (${(config.ttl.meta / 3600).toFixed(1)} hour)

🏥 HEALTH CHECKING
   Check Interval:      ${config.healthCheckInterval}ms
   Check Timeout:       ${config.healthCheckTimeout}ms

🔄 CLUSTERING
   Cluster Enabled:     ${config.enableCluster ? '✅' : '❌'}
   Sentinel Enabled:    ${config.enableSentinel ? '✅' : '❌'}
   ${config.sentinelHosts ? `Sentinel Nodes:      ${config.sentinelHosts.length}` : ''}

⚙️  ADVANCED
   Lua Scripts:         ${config.enableLuaScripts ? '✅' : '❌'}
   Persistence:         ${config.enablePersistence ? `✅ (${config.persistenceMode.toUpperCase()})` : '❌'}

═════════════════════════════════════════════
  `.trim();
}

/**
 * Export all configurations for testing
 */
export const allConfigs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Export as default
export default {
  getRedisConfig,
  getFinalRedisConfig,
  validateRedisConfig,
  displayConfigSummary,
  allConfigs,
};
