/**
 * Redis Caching Service - Singleton Pattern
 * 
 * Purpose: Cache API responses to prevent rate limiting (429 errors)
 * Features:
 * - Automatic fallback if Redis is unavailable
 * - Type-safe get/set operations
 * - TTL-based expiration
 * - Error resilience (bot never crashes if Redis fails)
 */

import Redis from 'ioredis';
import logger from '../utils/logger.js';

/**
 * Cache TTL Constants (in seconds)
 */
export const CacheTTL = {
  PLAYER_PROFILE: 3600,      // 1 hour - profiles change rarely
  MATCH_DATA: 86400,          // 24 hours - matches never change
  MATCH_HISTORY: 1800,        // 30 minutes - recent matches may update
  META_HEROES: 3600,          // 1 hour - meta changes slowly
  GUILD_SETTINGS: 0,          // No expiry - manual invalidation
} as const;

/**
 * Redis Service - Singleton
 */
class RedisService {
  private client: Redis | null = null;
  private isConnected = false;
  private isConnectionAttempted = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Redis connection
   * Fails gracefully if Redis is unavailable
   */
  private initialize(): void {
    if (this.isConnectionAttempted) return;
    this.isConnectionAttempted = true;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        retryStrategy: (times: number) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            logger.warn('⚠️ Redis connection failed after 3 attempts. Operating without cache.');
            return null; // Stop retrying
          }
          // Exponential backoff: 50ms, 100ms, 200ms
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('✅ Redis connected successfully');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('✅ Redis ready for operations');
      });

      this.client.on('error', (error: Error) => {
        this.isConnected = false;
        logger.error({ error }, '❌ Redis error');
        // Don't crash - just log and continue without cache
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('⚠️ Redis connection closed');
      });

      this.client.on('reconnecting', () => {
        logger.info('🔄 Redis reconnecting...');
      });

    } catch (error) {
      logger.error({ error }, '❌ Failed to initialize Redis');
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Increment a counter key and ensure it expires.
   * Useful for lightweight rate limiting.
   *
   * @param key - Redis key to increment
   * @param windowSeconds - Expiration window for the counter
   * @returns Object with current count, remaining TTL, and connectivity flag
   */
  async incrementWithTTL(
    key: string,
    windowSeconds: number
  ): Promise<{ count: number; ttl: number; connected: boolean }> {
    if (!this.client || !this.isConnected) {
      return { count: 1, ttl: windowSeconds, connected: false };
    }

    try {
      const count = await this.client.incr(key);

      if (count === 1) {
        await this.client.expire(key, windowSeconds);
        return { count, ttl: windowSeconds, connected: true };
      }

      const ttl = await this.client.ttl(key);
      return { count, ttl, connected: true };
    } catch (error) {
      logger.error({ key, error }, 'Redis INCR error');
      return { count: 1, ttl: windowSeconds, connected: false };
    }
  }

  /**
   * Get cached value by key
   * Returns null if key doesn't exist or Redis is unavailable
   * 
   * @param key - Cache key
   * @returns Parsed value or null
   */
  async get<T>(key: string): Promise<T | null> {
    // Graceful degradation if Redis unavailable
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      
      if (!value) {
        return null;
      }

      // Parse JSON value
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error({ key, error }, 'Redis GET error');
      return null;
    }
  }

  /**
   * Set cache value with TTL
   * Fails silently if Redis is unavailable (doesn't throw)
   * 
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (0 = no expiry)
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    // Graceful degradation if Redis unavailable
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds > 0) {
        // Set with expiration
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        // Set without expiration
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error({ key, error }, 'Redis SET error');
      // Don't throw - just log and continue
    }
  }

  /**
   * Delete cached value
   * Fails silently if Redis is unavailable
   * 
   * @param key - Cache key to delete
   */
  async del(key: string): Promise<void> {
    // Graceful degradation if Redis unavailable
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error({ key, error }, 'Redis DEL error');
      // Don't throw - just log and continue
    }
  }

  /**
   * Delete multiple keys matching pattern
   * Useful for cache invalidation
   * 
   * @param pattern - Redis key pattern (e.g., 'player:*')
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`🗑️ Deleted ${keys.length} keys matching "${pattern}"`);
      }
    } catch (error) {
      logger.error({ pattern, error }, 'Redis DEL pattern error');
    }
  }

  /**
   * Check if key exists in cache
   * 
   * @param key - Cache key
   * @returns true if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error({ key, error }, 'Redis EXISTS error');
      return false;
    }
  }

  /**
   * Get remaining TTL for a key (in seconds)
   * 
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -2;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error({ key, error }, 'Redis TTL error');
      return -2;
    }
  }

  /**
   * Clear all cache (USE WITH CAUTION)
   * Only use in development or testing
   */
  async flushAll(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.flushall();
      logger.info('🗑️ Redis cache cleared');
    } catch (error) {
      logger.error({ error }, 'Redis FLUSHALL error');
    }
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; client: boolean } {
    return {
      connected: this.isConnected,
      client: this.client !== null,
    };
  }

  /**
   * Close Redis connection
   * Call on bot shutdown
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        logger.info('✅ Redis disconnected gracefully');
      } catch (error) {
        logger.error({ error }, 'Error disconnecting Redis');
      }
    }
  }
}

// Singleton instance
export const redisService = new RedisService();

// Export class for testing
export { RedisService };
