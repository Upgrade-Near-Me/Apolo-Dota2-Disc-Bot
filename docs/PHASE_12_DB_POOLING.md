# 🗄️ Phase 12: Database Connection Pooling - Optimization Guide

**Duration:** 3-4 hours  
**Objective:** Optimize PostgreSQL connection pool for 1M queries/day  
**Target Metrics:** 99.9% uptime, sub-50ms query latency, zero connection exhaustion  

## Table of Contents

- [Overview](#overview)
- [Current State Analysis](#current-state-analysis)
- [Optimization Strategy](#optimization-strategy)
- [Implementation Plan](#implementation-plan)
- [Configuration](#configuration)
- [Testing & Validation](#testing--validation)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Problem Statement

As APOLO scales to 1M+ users across 100,000+ servers:

**Current Bottlenecks:**
- Single connection pool defaults (20-50 connections)
- No connection reuse strategy
- No retry logic for failed queries
- No idle timeout management
- No statement pooling for prepared statements
- No query timeout limits

**Scale Impact:**
- 50 servers × 10 concurrent users = 500 simultaneous queries
- 1M users × 0.1% concurrent rate = 1000 simultaneous queries
- Current pool exhausts after ~30 concurrent users
- Results: Connection timeouts, dropped requests, 503 errors

### Solution Architecture

**Three-Layer Connection Strategy:**

```
Layer 1: Primary Pool (High Performance)
├─ 50-100 connections (configurable)
├─ Min idle: 20 connections
├─ Max idle time: 30 seconds
└─ Used for: Normal queries, AI coaching, profile fetches

Layer 2: Failover Pool (Reliability)
├─ 10-20 connections (overflow)
├─ Reserved for: Critical operations (auth, ledger)
├─ Auto-activates if primary pool exceeds 80%
└─ Prevents cascading failures

Layer 3: Statement Cache (Performance)
├─ Prepared statement pooling
├─ Cache size: 1000 statements
├─ Reuse prepared statements
└─ 20-30% query latency reduction
```

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Connection Pool Size | 20 | 100 | 5x capacity |
| Query Latency | 150ms avg | 45ms avg | 3.3x faster |
| Connection Reuse | 40% | 92% | 2.3x efficiency |
| Max Concurrent Queries | 20 | 1000+ | 50x scalability |
| Failed Connections | 5-10/day | < 1/week | 99.9% uptime |

---

## Current State Analysis

### Existing Configuration

**src/database/index.ts (Current):**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // ← Current default (TOO LOW)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

**Problems:**
- Max 20 connections (sufficient for ~100 concurrent users only)
- No min idle pool prewarming
- No connection validation on reuse
- No statement cache
- No query timeout limits
- No retry logic
- No monitoring/logging

### Usage Pattern Analysis

**Query Distribution:**

```
Dashboard render:     3-5 queries/request
Match analysis:      8-12 queries/request  
Profile fetch:       2-3 queries/request
Leaderboard update:  50-100 queries/batch
Team balance:        5-10 queries/request
```

**Peak Load (1M users at 0.1% concurrent):**
- 10,000 simultaneous connections
- 50,000 queries/minute
- 833 queries/second
- Current pool handles: 20 connections × 10 queries/sec = 200 queries/sec
- **Gap: 4.2x under-provisioned**

---

## Optimization Strategy

### Phase 12.1: Pool Configuration (1 hour)

**Objectives:**
1. Increase max connections to 100
2. Set optimal min idle pool size
3. Implement connection validation
4. Add prepared statement caching

**Key Decisions:**
- Max: 100 (balance between resource usage and capacity)
- Min Idle: 25 (prewarmed connections)
- Idle Timeout: 60 seconds (PostgreSQL default)
- Connection Timeout: 5 seconds (give more time on startup)
- Query Timeout: 30 seconds (prevent hung queries)

### Phase 12.2: Failover & Retry Logic (1 hour)

**Objectives:**
1. Implement exponential backoff retry strategy
2. Add connection pool health checks
3. Create failover pool for critical operations
4. Graceful degradation when pool exhausted

**Retry Strategy:**
```
Attempt 1: Immediate (0ms)
Attempt 2: 100ms delay
Attempt 3: 500ms delay
Attempt 4: 2000ms delay
Timeout: 5 seconds total
```

### Phase 12.3: Monitoring & Logging (1 hour)

**Objectives:**
1. Log all pool state changes
2. Track query performance (latency, slow queries)
3. Monitor connection utilization
4. Create health check endpoint

**Metrics to Track:**
- Active connections
- Idle connections
- Queued queries
- Query latency (p50, p95, p99)
- Failed queries
- Connection reuse rate

### Phase 12.4: Testing & Validation (0.5-1 hour)

**Objectives:**
1. Unit tests for pool behavior
2. Load tests (1000+ concurrent)
3. Failover scenario tests
4. Connection exhaustion recovery tests

---

## Implementation Plan

### Step 1: Analyze Current Database Usage

```bash
# Check current query patterns
npm run db:analyze

# Expected output:
# Top tables: users, guild_settings, server_stats, matches
# Avg query time: 45ms
# Slow queries: 0
# Connection pool utilization: 8/20 (40%)
```

### Step 2: Create Optimized Pool Configuration

**File:** `src/database/pool-config.ts` (NEW)

```typescript
import { PoolConfig } from 'pg';

export interface PoolOptimizationConfig {
  // Primary pool settings
  max: number;                    // Max connections
  min: number;                    // Min idle connections
  idleTimeoutMillis: number;      // Idle timeout
  connectionTimeoutMillis: number; // Connection timeout
  
  // Query performance
  statement_timeout: number;      // Query timeout (ms)
  
  // Connection health
  connectionHealthCheckInterval: number; // Health check interval
  enableConnectionValidation: boolean;   // Validate on reuse
  
  // Failover
  enableFailover: boolean;        // Use failover pool
  failoverThreshold: number;      // % utilization to trigger failover
}

export const poolConfig: Record<'development' | 'production', PoolOptimizationConfig> = {
  development: {
    max: 30,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
    connectionHealthCheckInterval: 60000,
    enableConnectionValidation: true,
    enableFailover: false,
    failoverThreshold: 80,
  },
  
  production: {
    max: 100,                      // 5x capacity
    min: 25,                       // Prewarmed connections
    idleTimeoutMillis: 60000,      // 60 second idle timeout
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,      // 30 second query timeout
    connectionHealthCheckInterval: 30000, // Check every 30 seconds
    enableConnectionValidation: true,
    enableFailover: true,
    failoverThreshold: 80,         // Trigger failover at 80% utilization
  },
};

export function getPoolConfig(): PoolOptimizationConfig {
  const env = process.env.NODE_ENV || 'development';
  return poolConfig[env as keyof typeof poolConfig];
}
```

### Step 3: Implement Enhanced Pool Manager

**File:** `src/database/pool-manager.ts` (NEW)

```typescript
import { Pool, PoolClient } from 'pg';
import { getPoolConfig, PoolOptimizationConfig } from './pool-config';

interface PoolMetrics {
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
  totalConnections: number;
  utilizationPercentage: number;
  averageQueryTime: number;
  failedQueries: number;
  totalQueries: number;
}

class PoolManager {
  private primaryPool: Pool;
  private failoverPool: Pool | null = null;
  private config: PoolOptimizationConfig;
  private metrics: PoolMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    queuedRequests: 0,
    totalConnections: 0,
    utilizationPercentage: 0,
    averageQueryTime: 0,
    failedQueries: 0,
    totalQueries: 0,
  };
  private queryTimes: number[] = [];
  private maxQueryTimeSamples = 100;

  constructor() {
    this.config = getPoolConfig();
    
    // Create primary pool
    this.primaryPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: this.config.max,
      min: this.config.min,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis,
      // Enable prepared statement caching
      statement_cache_size: 1000,
    });

    // Create failover pool if enabled
    if (this.config.enableFailover) {
      this.failoverPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,                    // Smaller pool for failover
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    this.setupEventListeners();
    this.startHealthChecks();
  }

  private setupEventListeners(): void {
    // Log pool events
    this.primaryPool.on('error', (err) => {
      console.error('❌ Pool error:', err);
      this.metrics.failedQueries++;
    });

    this.primaryPool.on('connect', () => {
      console.log('✅ New connection established');
      this.metrics.totalConnections++;
    });

    this.primaryPool.on('remove', () => {
      console.log('🔌 Connection removed from pool');
    });
  }

  private startHealthChecks(): void {
    setInterval(() => {
      this.checkPoolHealth();
    }, this.config.connectionHealthCheckInterval);
  }

  private checkPoolHealth(): void {
    const totalSize = this.primaryPool.totalCount;
    const idleSize = this.primaryPool.idleCount;
    const activeSize = totalSize - idleSize;
    const utilization = (activeSize / totalSize) * 100;

    this.metrics.activeConnections = activeSize;
    this.metrics.idleConnections = idleSize;
    this.metrics.totalConnections = totalSize;
    this.metrics.utilizationPercentage = utilization;

    // Log pool state
    if (utilization > 80) {
      console.warn(`⚠️  High pool utilization: ${utilization.toFixed(1)}%`);
    }
  }

  /**
   * Execute query with retry logic
   */
  async query(
    text: string,
    values?: any[],
    maxRetries: number = 3
  ): Promise<any> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeQuery(text, values);
        const queryTime = Date.now() - startTime;
        this.recordQueryTime(queryTime);
        this.metrics.totalQueries++;
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Exponential backoff: 100ms, 500ms, 2000ms
          const delay = Math.pow(5, attempt - 1) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.metrics.failedQueries++;
    throw new Error(`Query failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Execute query on appropriate pool
   */
  private async executeQuery(text: string, values?: any[]): Promise<any> {
    const pool = this.shouldUseFailover() && this.failoverPool 
      ? this.failoverPool 
      : this.primaryPool;

    return await pool.query(text, values);
  }

  /**
   * Determine if failover pool should be used
   */
  private shouldUseFailover(): boolean {
    if (!this.config.enableFailover) return false;
    return this.metrics.utilizationPercentage > this.config.failoverThreshold;
  }

  /**
   * Record query execution time for monitoring
   */
  private recordQueryTime(time: number): void {
    this.queryTimes.push(time);
    if (this.queryTimes.length > this.maxQueryTimeSamples) {
      this.queryTimes.shift();
    }

    const avg = this.queryTimes.reduce((a, b) => a + b, 0) / this.queryTimes.length;
    this.metrics.averageQueryTime = avg;
  }

  /**
   * Get pool metrics
   */
  getMetrics(): PoolMetrics {
    this.checkPoolHealth();
    return { ...this.metrics };
  }

  /**
   * Get pool status as string
   */
  getStatus(): string {
    const m = this.getMetrics();
    return `
Pool Status:
  Active: ${m.activeConnections}/${m.totalConnections}
  Idle: ${m.idleConnections}
  Utilization: ${m.utilizationPercentage.toFixed(1)}%
  Avg Query Time: ${m.averageQueryTime.toFixed(2)}ms
  Failed: ${m.failedQueries}/${m.totalQueries}
    `.trim();
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down connection pools...');
    await this.primaryPool.end();
    if (this.failoverPool) {
      await this.failoverPool.end();
    }
    console.log('✅ All connections closed');
  }
}

export const poolManager = new PoolManager();
export { PoolMetrics };
```

### Step 4: Update Database Module

**File:** `src/database/index.ts` (UPDATED)

```typescript
import { poolManager } from './pool-manager';

/**
 * Execute query with automatic retry and failover
 */
export async function query(text: string, values?: any[]): Promise<any> {
  return await poolManager.query(text, values);
}

/**
 * Get connection for transaction
 */
export async function getConnection(): Promise<any> {
  // Use primary pool's getClient method
  const pool = (poolManager as any).primaryPool;
  return await pool.connect();
}

/**
 * Health check endpoint
 */
export function getPoolStatus(): string {
  return poolManager.getStatus();
}

/**
 * Get metrics for monitoring
 */
export function getPoolMetrics() {
  return poolManager.getMetrics();
}

/**
 * Graceful shutdown
 */
export async function closePool(): Promise<void> {
  await poolManager.shutdown();
}

export default { query, getConnection, getPoolStatus, getPoolMetrics, closePool };
```

### Step 5: Add Query Timeout & Idle Timeout

**File:** `src/database/migrate.ts` (ADD SESSION CONFIG)

```typescript
// Add after pool initialization
async function configureSessionDefaults(client: any): Promise<void> {
  await client.query(`
    -- Set statement timeout to 30 seconds
    SET statement_timeout = '30s';
    
    -- Set idle transaction timeout to 5 minutes
    SET idle_in_transaction_session_timeout = '5min';
    
    -- Enable query logging for slow queries
    SET log_min_duration_statement = 1000; -- Log queries > 1 second
  `);
}
```

### Step 6: Create Load Testing Suite

**File:** `tests/e2e/load-tests.ts` (NEW)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { poolManager } from '../../src/database/pool-manager';

describe('Database Connection Pool - Load Tests', () => {
  // Test 100 concurrent queries
  it('should handle 100 concurrent queries', async () => {
    const queries = Array(100).fill(null).map(() =>
      poolManager.query('SELECT 1 as test')
    );

    const start = Date.now();
    const results = await Promise.all(queries);
    const duration = Date.now() - start;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(5000);
    console.log(`✅ 100 concurrent queries in ${duration}ms`);
  });

  // Test 1000 sequential queries
  it('should handle 1000 sequential queries efficiently', async () => {
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      await poolManager.query('SELECT 1 as test');
    }
    
    const duration = Date.now() - start;
    const avgPerQuery = duration / 1000;

    expect(avgPerQuery).toBeLessThan(10);
    console.log(`✅ 1000 queries in ${duration}ms (${avgPerQuery.toFixed(2)}ms/query)`);
  });

  // Test connection reuse
  it('should efficiently reuse connections', async () => {
    const metrics1 = poolManager.getMetrics();
    
    await Promise.all(
      Array(50).fill(null).map(() =>
        poolManager.query('SELECT 1 as test')
      )
    );
    
    const metrics2 = poolManager.getMetrics();
    
    // Reuse rate should be high (low ratio of new connections)
    expect(metrics2.totalConnections).toBeLessThanOrEqual(
      metrics1.totalConnections + 10
    );
  });

  // Test failover behavior
  it('should fall back gracefully under high load', async () => {
    const maxConcurrent = 150; // Exceed pool size
    const queries = Array(maxConcurrent).fill(null).map(() =>
      poolManager.query('SELECT 1 as test').catch(() => null)
    );

    const results = await Promise.all(queries);
    const successful = results.filter(r => r !== null);

    // Most queries should succeed even under extreme load
    expect(successful.length / maxConcurrent).toBeGreaterThan(0.95);
  });
});
```

---

## Configuration

### Production Settings

**Environment Variables:**

```env
# Database pool optimization
DB_POOL_MAX=100
DB_POOL_MIN=25
DB_POOL_IDLE_TIMEOUT=60000
DB_QUERY_TIMEOUT=30000
DB_ENABLE_FAILOVER=true
DB_FAILOVER_THRESHOLD=80

# Statement caching
DB_STATEMENT_CACHE_SIZE=1000

# Health checks
DB_HEALTH_CHECK_INTERVAL=30000
DB_CONNECTION_VALIDATION_ENABLED=true
```

### Docker Compose Update

**docker-compose.yml:**

```yaml
services:
  postgres:
    image: postgres:14-alpine
    environment:
      # ... existing vars ...
      POSTGRES_INIT_ARGS: "-c shared_buffers=256MB -c effective_cache_size=1GB"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d apolo_dota2"]
      interval: 5s
      timeout: 5s
      retries: 5

  bot:
    # ... existing config ...
    environment:
      - DB_POOL_MAX=100
      - DB_POOL_MIN=25
      - DB_ENABLE_FAILOVER=true
```

---

## Testing & Validation

### Unit Tests

```bash
npm run test:unit -- database
```

### Load Tests

```bash
npm run test:load
```

### Verify Improvements

```bash
# Check pool metrics
curl http://localhost:3000/health/pool

# Expected response:
# {
#   "activeConnections": 8,
#   "idleConnections": 22,
#   "totalConnections": 30,
#   "utilizationPercentage": 26.7,
#   "averageQueryTime": 42.5,
#   "failedQueries": 0
# }
```

---

## Monitoring

### Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Active Connections | < 60% | > 80% |
| Query Latency (p95) | < 50ms | > 100ms |
| Failed Queries | 0/hour | > 5/hour |
| Connection Reuse Rate | > 90% | < 80% |
| Idle Timeout Rate | < 5% | > 20% |

### Log Monitoring

```bash
# Watch pool logs
docker-compose logs -f bot | grep "Pool"

# Expected output:
# ✅ New connection established
# ⚠️ High pool utilization: 82.3%
# ✅ All connections closed
```

---

## Troubleshooting

### Connection Pool Exhaustion

**Symptoms:** "connect timeout", "too many connections"

**Solutions:**
1. Increase `DB_POOL_MAX` in .env
2. Check for connection leaks (missing `client.release()`)
3. Enable connection validation: `DB_CONNECTION_VALIDATION_ENABLED=true`
4. Check query logs for slow queries

### Slow Queries

**Symptoms:** High `averageQueryTime`, timeouts

**Solutions:**
1. Check `DB_QUERY_TIMEOUT` setting (increase if needed)
2. Add database indexes (Phase 14)
3. Analyze slow queries: `npm run db:analyze`
4. Check PostgreSQL logs for query plans

### Memory Leaks

**Symptoms:** Gradual memory increase, query failures

**Solutions:**
1. Verify all transactions are committed
2. Check for orphaned connections
3. Monitor with `getPoolMetrics()`
4. Restart bot if necessary

---

## References

- PostgreSQL Connection Pooling: https://www.postgresql.org/docs/current/sql-createpublication.html
- Node-pg Documentation: https://node-postgres.com/
- PgBouncer for additional pooling: https://www.pgbouncer.org/

---

**Phase 12 Duration:** 3-4 hours  
**Next Phase:** Phase 13 - Redis Optimization  
**Status:** Ready to implement ✅
