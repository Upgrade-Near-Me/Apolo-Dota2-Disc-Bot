/**
 * PHASE 13: Redis Manager Implementation
 * 
 * Enterprise Redis connection pooling and cache management
 * - ioredis connection pool with retry logic
 * - Cache metrics tracking
 * - TTL-based tier management
 * - Memory monitoring and optimization
 * - Health checks and automatic recovery
 * 
 * Duration: ~1 hour
 * Status: Phase 13.1-13.3 (Connection, TTL, Memory)
 */

import Redis from 'ioredis';
import type { RedisOptimizationConfig } from './redis-config.js';

/**
 * Cache metrics for monitoring and optimization
 */
export interface CacheMetrics {
  // Hit/miss tracking
  totalCommands: number;
  hits: number;
  misses: number;
  hitRate: number;

  // Memory tracking
  memoryUsed: number;
  memoryPeak: number;
  memoryRatio: number;      // Used / Max

  // Key distribution
  keyCount: number;
  evictedKeys: number;
  expiredKeys: number;

  // Connection tracking
  connectedClients: number;
  usedConnections: number;

  // Performance
  avgCommandTime: number;
  p95CommandTime: number;
  p99CommandTime: number;
  slowCommands: number;
}

/**
 * Redis Manager
 * 
 * Manages connection pooling, caching strategies, and performance optimization
 */
export class RedisManager {
  private redis: Redis;
  private config: RedisOptimizationConfig;
  private metrics: CacheMetrics;
  private commandTimes: number[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly maxCommandTimes = 10000;
  private slowCommandThreshold = 10; // ms

  constructor(config: RedisOptimizationConfig) {
    this.config = config;

    // Initialize metrics
    this.metrics = {
      totalCommands: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      memoryUsed: 0,
      memoryPeak: 0,
      memoryRatio: 0,
      keyCount: 0,
      evictedKeys: 0,
      expiredKeys: 0,
      connectedClients: 0,
      usedConnections: 0,
      avgCommandTime: 0,
      p95CommandTime: 0,
      p99CommandTime: 0,
      slowCommands: 0,
    };

    // Create Redis connection with enterprise config
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,

      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      connectTimeout: config.connectionTimeout,
      commandTimeout: config.commandTimeout,

      // Sentinel support
      ...(config.enableSentinel &&
        config.sentinelHosts && {
          sentinels: config.sentinelHosts,
          name: 'mymaster',
          sentinelMaxRedirections: 10,
          sentinelRetryStrategy: (times: number) => Math.min(times * 100, 1000),
        }),

      // Cluster support
      ...(config.enableCluster && {
        cluster: true,
        clusterRetryStrategy: (times: number) => Math.min(times * 100, 1000),
      }),

      // Reconnection strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);
        console.log(`🔄 Redis reconnect attempt ${times} (delay: ${delay}ms)`);
        return delay;
      },

      // Handle connection errors gracefully
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          console.warn('⚠️  Redis READONLY - attempting reconnect');
          return true;
        }
        return false;
      },

      // Lazy connect (connect on first command)
      lazyConnect: false,
    });

    this.setupEventListeners();
    this.startHealthChecks();
  }

  /**
   * Setup Redis event listeners
   */
  private setupEventListeners(): void {
    this.redis.on('ready', () => {
      console.log('✅ Redis ready');
      this.configureRedisServer();
    });

    this.redis.on('error', (err: Error) => {
      console.error('❌ Redis error:', err.message);
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.redis.on('close', () => {
      console.log('🔴 Redis connection closed');
    });
  }

  /**
   * Configure Redis server with optimization settings
   */
  private configureRedisServer(): void {
    try {
      // Set memory limit and eviction policy
      void this.redis.config('SET', 'maxmemory', String(this.config.maxMemory));
      void this.redis.config('SET', 'maxmemory-policy', this.config.maxMemoryPolicy);

      // Enable persistence if configured
      if (this.config.enablePersistence) {
        if (this.config.persistenceMode === 'aof' || this.config.persistenceMode === 'both') {
          void this.redis.config('SET', 'appendonly', 'yes');
        }
      }

      console.log(`🔧 Redis configured:`);
      console.log(`   Max Memory: ${(this.config.maxMemory / 1024 / 1024).toFixed(0)}MB`);
      console.log(`   Eviction Policy: ${this.config.maxMemoryPolicy}`);
      console.log(`   Persistence: ${this.config.enablePersistence ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Redis configuration failed:', error);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval((): void => {
      void this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check and update metrics
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Get server stats
      const info = await this.redis.info('stats');
      const stats = this.parseRedisInfo(info);

      // Update command metrics
      if (stats.total_commands_processed) {
        this.metrics.totalCommands = parseInt(stats.total_commands_processed);
      }

      // Get memory metrics
      const memInfo = await this.redis.info('memory');
      const memStats = this.parseRedisInfo(memInfo);

      if (memStats.used_memory) {
        this.metrics.memoryUsed = parseInt(memStats.used_memory);
      }
      if (memStats.used_memory_peak) {
        this.metrics.memoryPeak = parseInt(memStats.used_memory_peak);
      }

      // Calculate memory ratio
      this.metrics.memoryRatio = this.metrics.memoryUsed / this.config.maxMemory;

      // Get key count
      const dbSize = await this.redis.dbsize();
      this.metrics.keyCount = dbSize;

      // Get client connections
      const clientInfo = await this.redis.info('clients');
      const clientStats = this.parseRedisInfo(clientInfo);
      if (clientStats.connected_clients) {
        this.metrics.connectedClients = parseInt(clientStats.connected_clients);
      }

      // Calculate hit rate
      if (this.metrics.totalCommands > 0) {
        this.metrics.hitRate = (this.metrics.hits / this.metrics.totalCommands) * 100;
      }

      // Calculate percentiles
      this.updatePercentiles();

      // Warn if nearing memory limit
      if (this.metrics.memoryRatio > 0.8) {
        console.warn(`⚠️  Redis memory usage HIGH: ${(this.metrics.memoryRatio * 100).toFixed(1)}%`);
      }

      if (this.metrics.memoryRatio > 0.95) {
        console.error(`🚨 Redis memory usage CRITICAL: ${(this.metrics.memoryRatio * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Parse Redis INFO response
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const obj: Record<string, string> = {};
    const lines = info.split('\r\n');

    for (const line of lines) {
      if (!line || line.startsWith('#')) continue;
      const [key, value] = line.split(':');
      if (key && value) {
        obj[key] = value;
      }
    }

    return obj;
  }

  /**
   * Update p95 and p99 percentiles
   */
  private updatePercentiles(): void {
    if (this.commandTimes.length === 0) return;

    const sorted = [...this.commandTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    this.metrics.p95CommandTime = sorted[p95Index] || 0;
    this.metrics.p99CommandTime = sorted[p99Index] || 0;
  }

  /**
   * Record command execution time
   */
  private recordCommand(duration: number, key?: string): void {
    this.commandTimes.push(duration);

    // Trim if too large
    if (this.commandTimes.length > this.maxCommandTimes) {
      this.commandTimes = this.commandTimes.slice(-this.maxCommandTimes);
    }

    // Track slow commands
    if (duration > this.slowCommandThreshold) {
      this.metrics.slowCommands++;
      if (key) {
        console.warn(`⚠️  Slow Redis command (${duration}ms): ${key}`);
      }
    }

    // Calculate running average
    const sum = this.commandTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgCommandTime = sum / this.commandTimes.length;
  }

  /**
   * Get value from cache (HIT or MISS)
   */
  async get(key: string): Promise<string | null> {
    const start = performance.now();

    try {
      const value = await this.redis.get(key);
      const duration = performance.now() - start;

      this.recordCommand(duration, key);

      if (value !== null) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }

      return value;
    } catch (error) {
      console.error(`❌ Redis GET failed for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value with TTL based on cache tier
   */
  async set(
    key: string,
    value: string,
    tier: 'api' | 'session' | 'meta' = 'api'
  ): Promise<void> {
    const start = performance.now();
    const ttl = this.config.ttl[tier];

    try {
      await this.redis.setex(key, ttl, value);
      const duration = performance.now() - start;
      this.recordCommand(duration, key);
    } catch (error) {
      console.error(`❌ Redis SET failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set value without expiry (persistent)
   */
  async setPersistent(key: string, value: string): Promise<void> {
    const start = performance.now();

    try {
      await this.redis.set(key, value);
      const duration = performance.now() - start;
      this.recordCommand(duration, key);
    } catch (error) {
      console.error(`❌ Redis SET (persistent) failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      this.metrics.totalCommands++;
    } catch (error) {
      console.error(`❌ Redis DEL failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  async mDel(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      await this.redis.del(...keys);
      this.metrics.totalCommands++;
    } catch (error) {
      console.error('❌ Redis MDEL failed:', error);
      throw error;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    const start = performance.now();

    try {
      const values = await this.redis.mget(...keys);
      const duration = performance.now() - start;

      this.recordCommand(duration);

      // Track hits/misses
      values.forEach((v) => {
        if (v !== null) {
          this.metrics.hits++;
        } else {
          this.metrics.misses++;
        }
      });

      return values;
    } catch (error) {
      console.error('❌ Redis MGET failed:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, amount);
      this.metrics.totalCommands++;
      return result;
    } catch (error) {
      console.error(`❌ Redis INCRBY failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiry for existing key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
      this.metrics.totalCommands++;
    } catch (error) {
      console.error(`❌ Redis EXPIRE failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get formatted cache status
   */
  getStatus(): string {
    const m = this.metrics;
    const memPercent = (m.memoryRatio * 100).toFixed(1);

    return `
╔═══════════════════════════════════════╗
║      REDIS CACHE STATUS               ║
╚═══════════════════════════════════════╝

📊 PERFORMANCE
   Hit Rate:         ${m.hitRate.toFixed(1)}%
   Hits:             ${m.hits.toLocaleString()}
   Misses:           ${m.misses.toLocaleString()}
   Avg Command:      ${m.avgCommandTime.toFixed(2)}ms
   p95 Command:      ${m.p95CommandTime.toFixed(2)}ms
   p99 Command:      ${m.p99CommandTime.toFixed(2)}ms
   Slow Commands:    ${m.slowCommands.toLocaleString()}

💾 MEMORY
   Used:             ${(m.memoryUsed / 1024 / 1024).toFixed(1)}MB
   Peak:             ${(m.memoryPeak / 1024 / 1024).toFixed(1)}MB
   Max:              ${(this.config.maxMemory / 1024 / 1024).toFixed(0)}MB
   Usage:            ${memPercent}% ${this.getMemoryStatus(m.memoryRatio)}

🔑 KEYS
   Total Keys:       ${m.keyCount.toLocaleString()}
   Evicted:          ${m.evictedKeys.toLocaleString()}
   Expired:          ${m.expiredKeys.toLocaleString()}

🔌 CONNECTION
   Clients:          ${m.connectedClients}
   Used:             ${m.usedConnections}
   Total Commands:   ${m.totalCommands.toLocaleString()}

═══════════════════════════════════════
    `.trim();
  }

  /**
   * Get memory status indicator
   */
  private getMemoryStatus(ratio: number): string {
    if (ratio < 0.5) return '✅ OK';
    if (ratio < 0.7) return '🟡 CAUTION';
    if (ratio < 0.9) return '🟠 WARNING';
    return '🔴 CRITICAL';
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔴 Shutting down Redis manager...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    try {
      await this.redis.quit();
      console.log('✅ Redis connection closed gracefully');
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      this.redis.disconnect();
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<void> {
    await this.redis.flushall();
    this.metrics.keyCount = 0;
    this.metrics.evictedKeys = 0;
    console.log('⚠️  Redis cache flushed');
  }

  /**
   * Get raw Redis instance for custom operations
   */
  getInstance(): Redis {
    return this.redis;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('❌ Redis connection test failed:', error);
      return false;
    }
  }
}

export default RedisManager;
