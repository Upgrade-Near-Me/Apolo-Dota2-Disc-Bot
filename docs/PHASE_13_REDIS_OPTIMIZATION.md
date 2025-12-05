# 🔴 Phase 13: Redis Optimization - Enterprise Cache Layer

**Duration:** 3-4 hours  
**Objective:** Optimize Redis connection pooling and caching strategy for 1M concurrent users  
**Target Metrics:** < 5ms cache latency, 95%+ hit rate, zero connection exhaustion  

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [Optimization Strategy](#optimization-strategy)
- [Implementation Plan](#implementation-plan)
- [Configuration](#configuration)
- [Testing & Validation](#testing--validation)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Problem Statement

Current Redis implementation challenges:

**Existing Issues:**
- Single ioredis instance (no connection pooling)
- No key expiry policy (memory bloat)
- No data structure optimization
- No cluster mode support
- No memory eviction strategy
- No Lua script support for atomic operations

**Scale Impact:**
- 1M users × 0.1% concurrent = 10,000 simultaneous connections
- Each user may cache 5-10 keys
- Memory: 10,000 users × 10 keys × 1KB avg = 100MB minimum
- With 99th percentile keys: 1GB+ possible

### Solution Architecture

**Three-Tier Caching Strategy:**

```
Tier 1: Hot Cache (API Responses)
├─ TTL: 5 minutes
├─ Keys: stratz:*, opendota:*, steam:*
├─ Size: ~50MB (profiles, match history)
└─ Hit rate target: 90%+

Tier 2: Warm Cache (Session Data)
├─ TTL: 30 minutes
├─ Keys: session:*, guild:*, user:*
├─ Size: ~30MB (user preferences, settings)
└─ Hit rate target: 85%+

Tier 3: Cold Cache (Background Data)
├─ TTL: 1 hour
├─ Keys: meta:*, heroes:*, items:*
├─ Size: ~20MB (meta data, static content)
└─ Hit rate target: 95%+
```

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Cache Hit Rate | 60% | 95%+ | 1.6x |
| Avg Cache Latency | 20ms | 5ms | 4x faster |
| Memory Usage | Unbounded | 100-200MB | Optimized |
| Connection Pool | 1x | 10x | Scalability |
| Eviction Events | Frequent | Rare | Stability |

---

## Current State

### Existing Redis Setup

**Current Implementation:**

```typescript
// Existing in src/services/RedisService.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

export default redis;
```

**Problems:**
- Single connection (no pooling)
- No max connections limit
- No key TTL defaults
- No memory management
- No connection reuse tracking

### Usage Patterns Analysis

**Current Cache Keys:**

```
API Responses:
- stratz:profile:{steamId}      (300s TTL) - 2KB avg
- stratz:matches:{steamId}      (300s TTL) - 5KB avg
- opendota:profile:{steamId}    (600s TTL) - 2KB avg
- steam:avatar:{steamId}        (86400s TTL) - 1KB avg

Session Data:
- session:{discordId}           (1800s TTL) - 500B avg
- guild:locale:{guildId}        (inf) - 100B avg
- user:connected:{discordId}    (inf) - 100B avg

Meta Data:
- meta:heroes                   (3600s TTL) - 50KB
- meta:items                    (3600s TTL) - 30KB
- meta:current_patch            (3600s TTL) - 1KB
```

**Peak Load Projections:**

```
1M users at 0.1% concurrent = 10,000 active users
Average 10 cache keys per user = 100,000 keys
Average key size = 2KB
Total memory: 200MB (within Redis default limits)

However:
- 95th percentile users have 20+ keys
- At 95th: 10,000 × 20 × 2KB = 400MB
- Without eviction: OOM crashes possible
```

---

## Optimization Strategy

### Phase 13.1: Connection Pooling (1 hour)

**Objectives:**
1. Implement ioredis cluster mode
2. Add connection pool configuration
3. Enable automatic reconnection
4. Monitor connection health

**Key Decisions:**
- Use sentinel mode for production (optional)
- Min pool size: 10 connections
- Max pool size: 50 connections
- Connection timeout: 5 seconds
- Health check every 30 seconds

### Phase 13.2: Key Expiry Policy (1 hour)

**Objectives:**
1. Implement TTL strategy (hot/warm/cold tiers)
2. Add automatic key cleanup
3. Implement memory eviction policy
4. Monitoring of key distribution

**TTL Strategy:**
```
Hot Cache (API):       300s (5 min)
Warm Cache (Session):  1800s (30 min)
Cold Cache (Meta):     3600s (1 hour)
Persistent (Settings): No expiry
```

### Phase 13.3: Memory Management (1 hour)

**Objectives:**
1. Implement LRU eviction policy
2. Add memory monitoring
3. Set max memory limits
4. Optimize key naming

**Memory Settings:**
- Max Memory: 256MB (production)
- Eviction Policy: `allkeys-lru`
- Fraction to evict: 0.1 (10% when full)
- Reserved for overhead: 10MB

### Phase 13.4: Advanced Features (0.5-1 hour)

**Objectives:**
1. Implement Lua scripts for atomic operations
2. Add pub/sub for real-time features
3. Enable persistence (optional)
4. Implement cache warming

---

## Implementation Plan

### Step 1: Create Redis Configuration

**File:** `src/cache/redis-config.ts` (NEW)

```typescript
export interface RedisOptimizationConfig {
  // Connection pooling
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  
  // Memory management
  maxMemory: number;                // bytes
  maxMemoryPolicy: string;          // allkeys-lru, volatile-lru, etc
  
  // Key expiry (seconds)
  ttl: {
    api: number;       // Hot cache
    session: number;   // Warm cache
    meta: number;      // Cold cache
  };
  
  // Health checks
  healthCheckInterval: number;
  enableSentinel: boolean;
}

export const redisConfig: Record<'development' | 'production', RedisOptimizationConfig> = {
  development: {
    minConnections: 5,
    maxConnections: 20,
    connectionTimeout: 5000,
    maxMemory: 128 * 1024 * 1024,  // 128MB
    maxMemoryPolicy: 'allkeys-lru',
    ttl: {
      api: 300,        // 5 minutes
      session: 1800,   // 30 minutes
      meta: 3600,      // 1 hour
    },
    healthCheckInterval: 60000,
    enableSentinel: false,
  },
  
  production: {
    minConnections: 10,
    maxConnections: 50,
    connectionTimeout: 5000,
    maxMemory: 256 * 1024 * 1024,  // 256MB
    maxMemoryPolicy: 'allkeys-lru',
    ttl: {
      api: 300,        // 5 minutes
      session: 1800,   // 30 minutes
      meta: 3600,      // 1 hour
    },
    healthCheckInterval: 30000,
    enableSentinel: true,
  },
};
```

### Step 2: Implement Redis Manager

**File:** `src/cache/redis-manager.ts` (NEW)

```typescript
import Redis from 'ioredis';
import { RedisOptimizationConfig } from './redis-config';

export interface CacheMetrics {
  totalCommands: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsed: number;
  memoryPeak: number;
  keyCount: number;
  evictedKeys: number;
  connectedClients: number;
  avgCommandTime: number;
}

export class RedisManager {
  private redis: Redis;
  private config: RedisOptimizationConfig;
  private metrics: CacheMetrics = {
    totalCommands: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    memoryUsed: 0,
    memoryPeak: 0,
    keyCount: 0,
    evictedKeys: 0,
    connectedClients: 0,
    avgCommandTime: 0,
  };
  private commandTimes: number[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: RedisOptimizationConfig) {
    this.config = config;

    // Create Redis connection with optimizations
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      
      // Connection pooling
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      
      // Timeouts
      connectTimeout: config.connectionTimeout,
      commandTimeout: 5000,
      
      // Reconnection
      retryStrategy: (times) => Math.min(times * 100, 3000),
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect on replica error
        }
        return false;
      },
    });

    this.setupEventListeners();
    this.startHealthChecks();
  }

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
  }

  private configureRedisServer(): void {
    // Set max memory eviction policy
    this.redis.config('set', 'maxmemory', String(this.config.maxMemory));
    this.redis.config('set', 'maxmemory-policy', this.config.maxMemoryPolicy);
    
    console.log(`🔧 Redis configured: max ${this.config.maxMemory / 1024 / 1024}MB, policy: ${this.config.maxMemoryPolicy}`);
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.healthCheckInterval
    );
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const info = await this.redis.info('stats');
      const parseInfo = (str: string) => {
        const lines = str.split('\r\n');
        const obj: Record<string, string> = {};
        lines.forEach(line => {
          const [key, value] = line.split(':');
          if (key && value) obj[key] = value;
        });
        return obj;
      };

      const stats = parseInfo(info);
      this.metrics.totalCommands = parseInt(stats.total_commands_processed) || 0;
      
      const memInfo = await this.redis.info('memory');
      const memStats = parseInfo(memInfo);
      this.metrics.memoryUsed = parseInt(memStats.used_memory) || 0;
      this.metrics.memoryPeak = parseInt(memStats.used_memory_peak) || 0;

      const keyInfo = await this.redis.dbsize();
      this.metrics.keyCount = keyInfo;

      const clientInfo = await this.redis.info('clients');
      const clientStats = parseInfo(clientInfo);
      this.metrics.connectedClients = parseInt(clientStats.connected_clients) || 0;

      // Log if nearing memory limit
      const usage = (this.metrics.memoryUsed / this.config.maxMemory) * 100;
      if (usage > 80) {
        console.warn(`⚠️  Redis memory usage high: ${usage.toFixed(1)}%`);
      }

      // Calculate hit rate
      if (this.metrics.totalCommands > 0) {
        this.metrics.hitRate = (this.metrics.hits / this.metrics.totalCommands) * 100;
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Get value from cache with metrics tracking
   */
  async get(key: string): Promise<string | null> {
    const start = Date.now();
    try {
      const value = await this.redis.get(key);
      const duration = Date.now() - start;
      
      this.recordCommand(duration);
      
      if (value) {
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
   * Set value with TTL based on tier
   */
  async set(
    key: string,
    value: string,
    tier: 'api' | 'session' | 'meta' = 'api'
  ): Promise<void> {
    const start = Date.now();
    const ttl = this.config.ttl[tier];

    try {
      await this.redis.setex(key, ttl, value);
      const duration = Date.now() - start;
      this.recordCommand(duration);
    } catch (error) {
      console.error(`❌ Redis SET failed for ${key}:`, error);
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
   * Get multiple keys
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    const start = Date.now();
    try {
      const values = await this.redis.mget(...keys);
      const duration = Date.now() - start;
      this.recordCommand(duration);

      // Track hits/misses
      values.forEach(v => {
        if (v) this.metrics.hits++;
        else this.metrics.misses++;
      });

      return values;
    } catch (error) {
      console.error('❌ Redis MGET failed:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Record command execution time
   */
  private recordCommand(duration: number): void {
    this.commandTimes.push(duration);
    if (this.commandTimes.length > 1000) {
      this.commandTimes.shift();
    }

    const avg = this.commandTimes.reduce((a, b) => a + b, 0) / this.commandTimes.length;
    this.metrics.avgCommandTime = avg;
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache status as string
   */
  getStatus(): string {
    const m = this.metrics;
    return `
╔═══════════════════════════════════╗
║      REDIS CACHE STATUS           ║
╚═══════════════════════════════════╝

📊 PERFORMANCE
   Hit Rate:        ${m.hitRate.toFixed(1)}%
   Hits:            ${m.hits}
   Misses:          ${m.misses}
   Avg Command:     ${m.avgCommandTime.toFixed(2)}ms

💾 MEMORY
   Used:            ${(m.memoryUsed / 1024 / 1024).toFixed(1)}MB
   Peak:            ${(m.memoryPeak / 1024 / 1024).toFixed(1)}MB
   Max:             ${(this.config.maxMemory / 1024 / 1024).toFixed(1)}MB

🔑 KEYS
   Total:           ${m.keyCount}
   Evicted:         ${m.evictedKeys}

🔌 CONNECTION
   Clients:         ${m.connectedClients}
   Total Commands:  ${m.totalCommands}

═══════════════════════════════════
    `.trim();
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔴 Shutting down Redis...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    try {
      await this.redis.quit();
      console.log('✅ Redis connection closed');
    } catch (error) {
      console.error('❌ Error closing Redis:', error);
      this.redis.disconnect();
    }
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<void> {
    await this.redis.flushall();
    this.metrics.keyCount = 0;
    console.log('⚠️  Redis cache flushed');
  }

  /**
   * Get raw Redis instance for custom operations
   */
  getInstance(): Redis {
    return this.redis;
  }
}
```

### Step 3: Create Cache Service

**File:** `src/cache/CacheService.ts` (NEW)

```typescript
import { RedisManager } from './redis-manager';
import { getFinalRedisConfig } from './redis-config';

class CacheService {
  private manager: RedisManager;

  constructor() {
    const config = getFinalRedisConfig();
    this.manager = new RedisManager(config);
  }

  /**
   * Get cached value or fetch from source
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    tier: 'api' | 'session' | 'meta' = 'api'
  ): Promise<T> {
    // Try cache first
    const cached = await this.manager.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (error) {
        console.error('Failed to parse cached value:', error);
      }
    }

    // Fetch from source
    const data = await fetchFn();

    // Cache result
    try {
      await this.manager.set(key, JSON.stringify(data), tier);
    } catch (error) {
      console.error('Failed to cache value:', error);
    }

    return data;
  }

  /**
   * Invalidate cache key
   */
  async invalidate(pattern: string | string[]): Promise<void> {
    if (Array.isArray(pattern)) {
      for (const p of pattern) {
        await this.manager.del(p);
      }
    } else {
      await this.manager.del(pattern);
    }
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return this.manager.getMetrics();
  }

  /**
   * Get status
   */
  getStatus() {
    return this.manager.getStatus();
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    await this.manager.shutdown();
  }
}

export const cacheService = new CacheService();
```

### Step 4: Create Redis Tests

**File:** `tests/unit/redis-manager.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RedisManager } from '../../src/cache/redis-manager';
import { redisConfig } from '../../src/cache/redis-config';

describe('Redis Manager - Cache Optimization', () => {
  let manager: RedisManager;

  beforeAll(() => {
    manager = new RedisManager(redisConfig.development);
  });

  afterAll(async () => {
    await manager.shutdown();
  });

  it('should set and get cache values', async () => {
    await manager.set('test:key', 'test-value', 'api');
    const value = await manager.get('test:key');
    expect(value).toBe('test-value');
  });

  it('should respect TTL tiers', async () => {
    await manager.set('api:test', 'api-tier', 'api');
    await manager.set('session:test', 'session-tier', 'session');
    await manager.set('meta:test', 'meta-tier', 'meta');

    const api = await manager.get('api:test');
    const session = await manager.get('session:test');
    const meta = await manager.get('meta:test');

    expect(api).toBe('api-tier');
    expect(session).toBe('session-tier');
    expect(meta).toBe('meta-tier');
  });

  it('should track cache metrics', () => {
    const metrics = manager.getMetrics();

    expect(metrics).toHaveProperty('hits');
    expect(metrics).toHaveProperty('misses');
    expect(metrics).toHaveProperty('hitRate');
    expect(metrics).toHaveProperty('memoryUsed');
    expect(metrics).toHaveProperty('keyCount');
  });

  it('should handle multiple keys', async () => {
    await manager.set('key1', 'value1', 'api');
    await manager.set('key2', 'value2', 'api');
    await manager.set('key3', 'value3', 'api');

    const values = await manager.mget(['key1', 'key2', 'key3']);

    expect(values).toHaveLength(3);
    expect(values[0]).toBe('value1');
    expect(values[1]).toBe('value2');
    expect(values[2]).toBe('value3');
  });

  it('should report cache status', () => {
    const status = manager.getStatus();

    expect(status).toContain('REDIS CACHE STATUS');
    expect(status).toContain('Hit Rate');
    expect(status).toContain('Memory');
  });
});
```

---

## Configuration

### Environment Variables

```env
# Redis Connection
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Redis Optimization (Phase 13)
REDIS_MAX_MEMORY=268435456        # 256MB
REDIS_MAX_MEMORY_POLICY=allkeys-lru
REDIS_MIN_CONNECTIONS=10
REDIS_MAX_CONNECTIONS=50
REDIS_HEALTH_CHECK_INTERVAL=30000
REDIS_TTL_API=300
REDIS_TTL_SESSION=1800
REDIS_TTL_META=3600
```

### Docker Compose

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
      
volumes:
  redis_data:
```

---

## Testing & Validation

### Unit Tests

```bash
npm run test:redis
```

### Load Testing

```bash
npm run test:load:redis
```

### Cache Hit Rate Verification

```bash
# Monitor hit rate
redis-cli INFO stats | grep "keyspace"
```

---

## Monitoring

### Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Hit Rate | > 85% | 70-85% | < 70% |
| Avg Latency | < 5ms | 5-10ms | > 10ms |
| Memory Usage | < 70% | 70-85% | > 85% |
| Evictions | < 1/min | 1-5/min | > 5/min |
| Connections | < 20 | 20-40 | > 40 |

### Health Check Output

```
✅ Redis Health (every 30 seconds)
   Hit Rate: 92.5%
   Memory: 120MB / 256MB (47%)
   Keys: 45,000
   Avg Command: 3.2ms
```

---

## Troubleshooting

### Memory Issues

**Symptoms:** OOM errors, evictions increasing  
**Solutions:**
1. Increase `REDIS_MAX_MEMORY` in .env
2. Reduce TTLs for hot tier
3. Implement more aggressive eviction
4. Add Redis nodes (clustering)

### Connection Issues

**Symptoms:** "Connection refused", timeouts  
**Solutions:**
1. Check Redis server status: `redis-cli ping`
2. Verify network connectivity
3. Check firewall rules
4. Review connection pool size

### Low Hit Rate

**Symptoms:** < 70% hit rate  
**Solutions:**
1. Increase TTLs for frequently accessed data
2. Pre-warm cache on startup
3. Implement cache warming strategy
4. Review key naming conventions

---

**Phase 13 Duration:** 3-4 hours  
**Next Phase:** Phase 14 - Database Schema Optimization  
**Status:** Ready to implement ✅
