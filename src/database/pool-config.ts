/**
 * PHASE 12: Database Connection Pool Configuration
 * 
 * Optimizes PostgreSQL connection pool for enterprise scale (1M+ queries/day)
 * Supports development and production environments with appropriate settings
 */

export interface PoolOptimizationConfig {
  // Core pool settings
  max: number;                          // Max connections in pool
  min: number;                          // Min idle connections to maintain
  idleTimeoutMillis: number;            // How long connection can idle before closing
  connectionTimeoutMillis: number;      // Timeout for acquiring a connection

  // Query performance settings
  statement_timeout: number;            // Max query execution time (ms)
  statement_cache_size: number;         // Prepared statement cache size

  // Connection health
  connectionHealthCheckInterval: number; // How often to check pool health
  enableConnectionValidation: boolean;   // Validate connection before reuse
  connectionValidationQuery: string;     // Query to test connection validity

  // Failover settings
  enableFailover: boolean;              // Enable secondary failover pool
  failoverThreshold: number;            // % utilization to trigger failover
  failoverPoolSize: number;             // Size of failover pool
}

/**
 * Environment-specific pool configurations
 */
export const poolConfig: Record<'development' | 'production' | 'staging', PoolOptimizationConfig> = {
  /**
   * Development: Lower resource usage, fast feedback
   */
  development: {
    max: 30,
    min: 5,
    idleTimeoutMillis: 30000,            // 30 seconds
    connectionTimeoutMillis: 5000,       // 5 seconds
    statement_timeout: 30000,            // 30 seconds - generous for debugging
    statement_cache_size: 256,           // Small cache for dev
    connectionHealthCheckInterval: 60000, // 1 minute
    enableConnectionValidation: true,
    connectionValidationQuery: 'SELECT 1',
    enableFailover: false,               // Not needed in dev
    failoverThreshold: 80,
    failoverPoolSize: 10,
  },

  /**
   * Staging: Matches production with slightly higher resource limits
   */
  staging: {
    max: 75,
    min: 20,
    idleTimeoutMillis: 45000,            // 45 seconds
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
    statement_cache_size: 750,
    connectionHealthCheckInterval: 30000,
    enableConnectionValidation: true,
    connectionValidationQuery: 'SELECT 1',
    enableFailover: true,
    failoverThreshold: 80,
    failoverPoolSize: 15,
  },

  /**
   * Production: Maximum capacity for 1M+ users
   * 
   * Sizing calculation:
   * - Expected concurrent users: 1M × 0.1% (concurrent rate) = 10,000
   * - Queries per connection: ~10
   * - Query execution time: ~50ms
   * - Connection pool can serve: 100 × (50/50) = 100 concurrent users
   * - Multiply by safety factor of 10: need 1000 connections across shards
   * - Per bot instance (with 10 shards): 100 connections
   * 
   * However, connection pooling is per-bot, not global:
   * - Single bot can handle 100 connections
   * - Each shard manager maintains separate pools
   * - Total capacity: shards × 100 connections = scales linearly
   */
  production: {
    max: 100,                            // 5x dev default
    min: 25,                             // Prewarmed connections
    idleTimeoutMillis: 60000,            // 60 seconds
    connectionTimeoutMillis: 5000,       // 5 seconds
    statement_timeout: 30000,            // 30 seconds (strict)
    statement_cache_size: 1000,          // Large cache (matches PostgreSQL default)
    connectionHealthCheckInterval: 30000, // 30 seconds
    enableConnectionValidation: true,
    connectionValidationQuery: 'SELECT 1',
    enableFailover: true,                // Critical for reliability
    failoverThreshold: 80,               // Trigger failover at 80% utilization
    failoverPoolSize: 20,                // Reserve 20 connections for critical ops
  },

  /**
   * Test: Minimal configuration for unit/integration tests
   */
  test: {
    max: 5,                              // Small pool for tests
    min: 1,
    idleTimeoutMillis: 10000,            // 10 seconds
    connectionTimeoutMillis: 2000,
    statement_timeout: 5000,
    statement_cache_size: 50,
    connectionHealthCheckInterval: 60000,
    enableConnectionValidation: false,    // Faster tests
    connectionValidationQuery: 'SELECT 1',
    enableFailover: false,
    failoverThreshold: 90,
    failoverPoolSize: 1,
  },
};

/**
 * Get pool configuration for current environment
 * 
 * @returns {PoolOptimizationConfig} Configuration object for current NODE_ENV
 * @throws {Error} If NODE_ENV is not recognized
 */
export function getPoolConfig(): PoolOptimizationConfig {
  const env = (process.env.NODE_ENV || 'development') as keyof typeof poolConfig;

  if (!(env in poolConfig)) {
    throw new Error(
      `Invalid NODE_ENV: ${env}. Must be one of: development, staging, production, test`
    );
  }

  return poolConfig[env];
}

/**
 * Override specific pool settings via environment variables
 * 
 * Supported overrides (case-insensitive):
 * - DB_POOL_MAX
 * - DB_POOL_MIN
 * - DB_POOL_IDLE_TIMEOUT
 * - DB_QUERY_TIMEOUT
 * - DB_ENABLE_FAILOVER
 * - DB_FAILOVER_THRESHOLD
 * - DB_STATEMENT_CACHE_SIZE
 * 
 * @param {PoolOptimizationConfig} baseConfig - Base configuration to override
 * @returns {PoolOptimizationConfig} Configuration with environment overrides applied
 */
export function applyEnvironmentOverrides(
  baseConfig: PoolOptimizationConfig
): PoolOptimizationConfig {
  const config = { ...baseConfig };

  // Override with environment variables if provided
  if (process.env.DB_POOL_MAX) {
    config.max = parseInt(process.env.DB_POOL_MAX, 10);
  }

  if (process.env.DB_POOL_MIN) {
    config.min = parseInt(process.env.DB_POOL_MIN, 10);
  }

  if (process.env.DB_POOL_IDLE_TIMEOUT) {
    config.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10);
  }

  if (process.env.DB_QUERY_TIMEOUT) {
    config.statement_timeout = parseInt(process.env.DB_QUERY_TIMEOUT, 10);
  }

  if (process.env.DB_ENABLE_FAILOVER) {
    config.enableFailover = process.env.DB_ENABLE_FAILOVER.toLowerCase() === 'true';
  }

  if (process.env.DB_FAILOVER_THRESHOLD) {
    config.failoverThreshold = parseInt(process.env.DB_FAILOVER_THRESHOLD, 10);
  }

  if (process.env.DB_STATEMENT_CACHE_SIZE) {
    config.statement_cache_size = parseInt(process.env.DB_STATEMENT_CACHE_SIZE, 10);
  }

  // Validate configuration
  if (config.max < config.min) {
    throw new Error(`Invalid pool config: max (${config.max}) must be >= min (${config.min})`);
  }

  if (config.failoverThreshold < 1 || config.failoverThreshold > 100) {
    throw new Error(`Invalid failover threshold: must be between 1 and 100`);
  }

  return config;
}

/**
 * Get pool configuration with environment overrides applied
 * 
 * @returns {PoolOptimizationConfig} Final configuration for use
 */
export function getFinalPoolConfig(): PoolOptimizationConfig {
  const baseConfig = getPoolConfig();
  return applyEnvironmentOverrides(baseConfig);
}

/**
 * Configuration summary for logging on startup
 * 
 * @param {PoolOptimizationConfig} config - Configuration to describe
 * @returns {string} Formatted configuration summary
 */
export function getConfigSummary(config: PoolOptimizationConfig): string {
  return `
📊 Database Pool Configuration
═══════════════════════════════════════════════════
  Environment: ${process.env.NODE_ENV || 'development'}
  Max Connections: ${config.max}
  Min Idle: ${config.min}
  Idle Timeout: ${config.idleTimeoutMillis}ms
  Connection Timeout: ${config.connectionTimeoutMillis}ms
  Query Timeout: ${config.statement_timeout}ms
  Statement Cache: ${config.statement_cache_size}
  Connection Validation: ${config.enableConnectionValidation ? 'enabled' : 'disabled'}
  Failover Pool: ${config.enableFailover ? 'enabled' : 'disabled'}
  ${config.enableFailover ? `Failover Threshold: ${config.failoverThreshold}%` : ''}
═══════════════════════════════════════════════════
  `.trim();
}
