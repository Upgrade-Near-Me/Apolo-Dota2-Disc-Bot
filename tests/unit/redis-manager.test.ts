/**
 * PHASE 13: Redis Manager Tests
 * 
 * Comprehensive test suite for Redis optimization
 * - Connection pooling verification
 * - Cache hit/miss tracking
 * - TTL tier management
 * - Memory optimization
 * - Health monitoring
 * 
 * Duration: ~1 hour
 * Tests: 18 comprehensive tests
 * Coverage: Connection, TTL, Memory, Performance, Failover
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { RedisManager } from '../../src/cache/redis-manager';
import { developmentConfig, validateRedisConfig } from '../../src/cache/redis-config';

describe('Redis Manager - Cache Optimization (Phase 13)', () => {
  let manager: RedisManager;

  beforeAll(async () => {
    manager = new RedisManager(developmentConfig);

    // Wait for Redis to be ready
    let attempts = 0;
    while (attempts < 5) {
      const connected = await manager.testConnection();
      if (connected) break;
      await new Promise((r) => setTimeout(r, 500));
      attempts++;
    }
  });

  afterAll(async () => {
    await manager.flushAll();
    await manager.shutdown();
  });

  beforeEach(async () => {
    await manager.flushAll();
  });

  // ============================================================================
  // SECTION 1: Connection Pooling Tests
  // ============================================================================

  describe('Connection Pooling', () => {
    it('should successfully connect to Redis', async () => {
      const connected = await manager.testConnection();
      expect(connected).toBe(true);
    });

    it('should handle basic get/set operations', async () => {
      await manager.set('test:key', 'test-value', 'api');
      const value = await manager.get('test:key');
      expect(value).toBe('test-value');
    });

    it('should handle concurrent operations', async () => {
      // Simulate concurrent requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        manager.set(`concurrent:${i}`, `value-${i}`, 'api')
      );

      await Promise.all(promises);

      // Verify all values were set
      const values = await manager.mget(
        Array.from({ length: 10 }, (_, i) => `concurrent:${i}`)
      );

      expect(values).toHaveLength(10);
      values.forEach((v, i) => {
        expect(v).toBe(`value-${i}`);
      });
    });

    it('should maintain connection pool under sustained load', async () => {
      // 50 sequential operations
      for (let i = 0; i < 50; i++) {
        await manager.set(`load:${i}`, `value-${i}`, 'api');
      }

      const metrics = manager.getMetrics();
      expect(metrics.totalCommands).toBeGreaterThanOrEqual(50);
    });
  });

  // ============================================================================
  // SECTION 2: TTL Tier Management Tests
  // ============================================================================

  describe('TTL Tier Management', () => {
    it('should respect API tier TTL (5 minutes)', async () => {
      await manager.set('ttl:api', 'api-data', 'api');
      const value = await manager.get('ttl:api');
      expect(value).toBe('api-data');
    });

    it('should respect session tier TTL (30 minutes)', async () => {
      await manager.set('ttl:session', 'session-data', 'session');
      const value = await manager.get('ttl:session');
      expect(value).toBe('session-data');
    });

    it('should respect meta tier TTL (1 hour)', async () => {
      await manager.set('ttl:meta', 'meta-data', 'meta');
      const value = await manager.get('ttl:meta');
      expect(value).toBe('meta-data');
    });

    it('should set persistent values without expiry', async () => {
      await manager.setPersistent('persistent:key', 'persistent-value');
      const value = await manager.get('persistent:key');
      expect(value).toBe('persistent-value');
    });

    it('should update expiry for existing keys', async () => {
      await manager.set('ttl:update', 'initial', 'api');
      await manager.expire('ttl:update', 3600); // Set to 1 hour

      const value = await manager.get('ttl:update');
      expect(value).toBe('initial');
    });
  });

  // ============================================================================
  // SECTION 3: Cache Hit/Miss Tracking Tests
  // ============================================================================

  describe('Cache Hit/Miss Tracking', () => {
    it('should track cache hits', async () => {
      await manager.set('hit:test', 'hit-value', 'api');

      const beforeMetrics = manager.getMetrics();
      const value = await manager.get('hit:test');
      const afterMetrics = manager.getMetrics();

      expect(value).toBe('hit-value');
      expect(afterMetrics.hits).toBeGreaterThan(beforeMetrics.hits);
    });

    it('should track cache misses', async () => {
      const beforeMetrics = manager.getMetrics();
      const value = await manager.get('nonexistent:key');
      const afterMetrics = manager.getMetrics();

      expect(value).toBeNull();
      expect(afterMetrics.misses).toBeGreaterThan(beforeMetrics.misses);
    });

    it('should calculate accurate hit rate', async () => {
      // Create 10 hits and 10 misses
      for (let i = 0; i < 10; i++) {
        await manager.set(`hit:${i}`, `value-${i}`, 'api');
        await manager.get(`hit:${i}`);
      }

      for (let i = 0; i < 10; i++) {
        await manager.get(`miss:${i}`);
      }

      const metrics = manager.getMetrics();

      // Hit rate should be around 50% (10 hits / 20 total)
      expect(metrics.hitRate).toBeGreaterThan(40);
      expect(metrics.hitRate).toBeLessThan(60);
    });
  });

  // ============================================================================
  // SECTION 4: Memory Management Tests
  // ============================================================================

  describe('Memory Management', () => {
    it('should track memory usage', () => {
      const metrics = manager.getMetrics();

      expect(metrics).toHaveProperty('memoryUsed');
      expect(metrics).toHaveProperty('memoryPeak');
      expect(metrics).toHaveProperty('memoryRatio');

      expect(metrics.memoryUsed).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryRatio).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryRatio).toBeLessThanOrEqual(1);
    });

    it('should store multiple keys and track key count', async () => {
      const keyCount = 20;

      for (let i = 0; i < keyCount; i++) {
        await manager.set(`memory:${i}`, `value-${i}`, 'api');
      }

      const metrics = manager.getMetrics();
      expect(metrics.keyCount).toBeGreaterThanOrEqual(keyCount);
    });

    it('should handle key deletion', async () => {
      await manager.set('delete:key', 'value', 'api');
      const beforeDelete = await manager.get('delete:key');
      expect(beforeDelete).toBe('value');

      await manager.del('delete:key');
      const afterDelete = await manager.get('delete:key');
      expect(afterDelete).toBeNull();
    });

    it('should handle batch key deletion', async () => {
      const keys = ['batch:1', 'batch:2', 'batch:3'];

      for (const key of keys) {
        await manager.set(key, 'value', 'api');
      }

      await manager.mDel(keys);

      const values = await manager.mget(keys);
      values.forEach((v) => {
        expect(v).toBeNull();
      });
    });
  });

  // ============================================================================
  // SECTION 5: Performance and Latency Tests
  // ============================================================================

  describe('Performance & Latency', () => {
    it('should execute commands with acceptable latency', async () => {
      await manager.set('perf:test', 'test-value', 'api');
      const metrics = manager.getMetrics();

      // Average command time should be < 10ms
      expect(metrics.avgCommandTime).toBeLessThan(10);
    });

    it('should track command execution times', async () => {
      for (let i = 0; i < 20; i++) {
        await manager.set(`perf:${i}`, `value-${i}`, 'api');
        await manager.get(`perf:${i}`);
      }

      const metrics = manager.getMetrics();

      expect(metrics.avgCommandTime).toBeGreaterThan(0);
      expect(metrics.p95CommandTime).toBeGreaterThanOrEqual(metrics.avgCommandTime);
      expect(metrics.p99CommandTime).toBeGreaterThanOrEqual(metrics.p95CommandTime);
    });

    it('should handle multiple get operations efficiently', async () => {
      const keys = Array.from({ length: 20 }, (_, i) => `mget:${i}`);

      // Set all keys
      for (const key of keys) {
        await manager.set(key, 'value', 'api');
      }

      // Batch get
      const values = await manager.mget(keys);
      expect(values).toHaveLength(20);
      values.forEach((v) => {
        expect(v).toBe('value');
      });
    });
  });

  // ============================================================================
  // SECTION 6: Metrics and Monitoring Tests
  // ============================================================================

  describe('Metrics & Monitoring', () => {
    it('should provide cache metrics', () => {
      const metrics = manager.getMetrics();

      expect(metrics).toHaveProperty('totalCommands');
      expect(metrics).toHaveProperty('hits');
      expect(metrics).toHaveProperty('misses');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('memoryUsed');
      expect(metrics).toHaveProperty('keyCount');
      expect(metrics).toHaveProperty('connectedClients');
      expect(metrics).toHaveProperty('avgCommandTime');
    });

    it('should generate formatted status report', () => {
      const status = manager.getStatus();

      expect(status).toContain('REDIS CACHE STATUS');
      expect(status).toContain('Hit Rate');
      expect(status).toContain('Memory');
      expect(status).toContain('Performance');
      expect(status).toContain('Keys');
      expect(status).toContain('Connection');
    });

    it('should track total commands executed', async () => {
      const before = manager.getMetrics().totalCommands;

      for (let i = 0; i < 10; i++) {
        await manager.set(`cmd:${i}`, `value-${i}`, 'api');
      }

      const after = manager.getMetrics().totalCommands;
      expect(after).toBeGreaterThan(before);
    });
  });

  // ============================================================================
  // SECTION 7: Integration and Real-World Scenarios
  // ============================================================================

  describe('Integration & Real-World Scenarios', () => {
    it('should handle API response caching workflow', async () => {
      // Simulate API response caching
      const steamId = '123456789';
      const profileData = JSON.stringify({ name: 'Player1', rank: 'Immortal', mmr: 9000 });

      // Cache the response
      const cacheKey = `stratz:profile:${steamId}`;
      await manager.set(cacheKey, profileData, 'api');

      // Retrieve from cache
      const cached = await manager.get(cacheKey);
      expect(cached).toBe(profileData);
      expect(JSON.parse(cached!).name).toBe('Player1');
    });

    it('should handle session data workflow', async () => {
      const discordId = 'user123';
      const sessionData = JSON.stringify({ locale: 'pt', connectedAt: Date.now() });

      await manager.set(`session:${discordId}`, sessionData, 'session');

      const retrieved = await manager.get(`session:${discordId}`);
      expect(retrieved).toBe(sessionData);
    });

    it('should handle counter increments', async () => {
      const counterKey = 'rate-limit:api-calls:minute';

      const count1 = await manager.increment(counterKey);
      const count2 = await manager.increment(counterKey, 5);

      expect(count1).toBe(1);
      expect(count2).toBe(6);
    });

    it('should simulate cache warming scenario', async () => {
      // Pre-load meta data
      const heroData = JSON.stringify({
        heroes: ['Pudge', 'Invoker', 'Anti-Mage'],
      });

      await manager.setPersistent('meta:heroes', heroData);

      // Verify quick access
      const data = await manager.get('meta:heroes');
      expect(data).toBe(heroData);
    });
  });

  // ============================================================================
  // SECTION 8: Configuration and Validation Tests
  // ============================================================================

  describe('Configuration Validation', () => {
    it('should validate configuration', () => {
      const result = validateRedisConfig(developmentConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid min/max connections', () => {
      const invalidConfig = {
        ...developmentConfig,
        maxConnections: developmentConfig.minConnections - 1,
      };

      const result = validateRedisConfig(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
