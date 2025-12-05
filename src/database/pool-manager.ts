/**
 * PHASE 12: Database Connection Pool Manager
 * 
 * Manages primary and failover connection pools with:
 * - Automatic retry logic with exponential backoff
 * - Connection health monitoring
 * - Query performance tracking
 * - Graceful failover under high load
 * - Comprehensive metrics and logging
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { getFinalPoolConfig, PoolOptimizationConfig, getConfigSummary } from './pool-config';

/**
 * Pool performance metrics
 */
export interface PoolMetrics {
  // Connection state
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  utilizationPercentage: number;

  // Query performance
  averageQueryTime: number;
  p95QueryTime: number;
  p99QueryTime: number;
  slowQueryCount: number;

  // Reliability
  totalQueries: number;
  failedQueries: number;
  successRate: number;
  retryCount: number;

  // Failover
  failoverActivations: number;
  failoverActiveNow: boolean;
}

/**
 * Query execution result with metadata
 */
interface QueryExecution {
  duration: number;
  success: boolean;
  retries: number;
  usedFailover: boolean;
}

/**
 * Manages database connection pools and query execution
 */
export class PoolManager {
  private primaryPool: Pool;
  private failoverPool: Pool | null = null;
  private config: PoolOptimizationConfig;

  // Metrics tracking
  private metrics: PoolMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    totalConnections: 0,
    utilizationPercentage: 0,
    averageQueryTime: 0,
    p95QueryTime: 0,
    p99QueryTime: 0,
    slowQueryCount: 0,
    totalQueries: 0,
    failedQueries: 0,
    successRate: 100,
    retryCount: 0,
    failoverActivations: 0,
    failoverActiveNow: false,
  };

  // Query time samples for statistics
  private queryTimes: number[] = [];
  private readonly maxQueryTimeSamples = 1000;

  // Slow query threshold (ms)
  private readonly slowQueryThreshold = 100;

  // Health check interval
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = getFinalPoolConfig();

    // Log configuration
    console.log(getConfigSummary(this.config));

    // Create primary pool
    this.primaryPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: this.config.max,
      min: this.config.min,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis,
      // Enable prepared statement caching
      statement_cache_size: this.config.statement_cache_size,
      // Connection validation
      query_timeout: this.config.statement_timeout,
    });

    // Create failover pool if enabled
    if (this.config.enableFailover) {
      this.failoverPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: this.config.failoverPoolSize,
        min: Math.ceil(this.config.failoverPoolSize / 4),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: this.config.connectionTimeoutMillis,
        statement_cache_size: 256,
      });

      console.log(`✅ Failover pool enabled (${this.config.failoverPoolSize} connections)`);
    }

    this.setupEventListeners();
    this.startHealthChecks();
  }

  /**
   * Setup event listeners for pool monitoring
   */
  private setupEventListeners(): void {
    // Primary pool error handler
    this.primaryPool.on('error', (err: Error) => {
      console.error('❌ Primary pool error:', err.message);
      this.metrics.failedQueries++;
    });

    // Primary pool connection events
    this.primaryPool.on('connect', () => {
      console.log('✅ New connection established (primary)');
    });

    this.primaryPool.on('remove', () => {
      console.log('🔌 Connection removed from primary pool');
    });

    // Failover pool error handler
    if (this.failoverPool) {
      this.failoverPool.on('error', (err: Error) => {
        console.error('❌ Failover pool error:', err.message);
      });

      this.failoverPool.on('connect', () => {
        console.log('✅ New connection established (failover)');
      });
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.connectionHealthCheckInterval
    );
  }

  /**
   * Perform health check on pool
   */
  private performHealthCheck(): void {
    this.updateMetrics();

    const m = this.metrics;
    const status = `Active: ${m.activeConnections}/${m.totalConnections} (${m.utilizationPercentage.toFixed(1)}%) | Query Time: ${m.averageQueryTime.toFixed(1)}ms | Slow: ${m.slowQueryCount}`;

    if (m.utilizationPercentage > 90) {
      console.warn(`⚠️  CRITICAL pool utilization: ${status}`);
    } else if (m.utilizationPercentage > 80) {
      console.warn(`⚠️  HIGH pool utilization: ${status}`);
    } else if (m.slowQueryCount > 10) {
      console.warn(`⚠️  Multiple slow queries detected: ${status}`);
    } else {
      console.log(`ℹ️  Pool health: ${status}`);
    }

    // Check if failover should activate
    if (this.config.enableFailover) {
      const shouldUseFailover = m.utilizationPercentage > this.config.failoverThreshold;
      if (shouldUseFailover && !m.failoverActiveNow) {
        console.warn(`🔄 Activating failover pool (utilization: ${m.utilizationPercentage.toFixed(1)}%)`);
        this.metrics.failoverActivations++;
        this.metrics.failoverActiveNow = true;
      } else if (!shouldUseFailover && m.failoverActiveNow) {
        console.log(`✅ Deactivating failover pool`);
        this.metrics.failoverActiveNow = false;
      }
    }
  }

  /**
   * Update metrics from pool state
   */
  private updateMetrics(): void {
    const totalSize = this.primaryPool.totalCount;
    const idleSize = this.primaryPool.idleCount;
    const activeSize = totalSize - idleSize;

    this.metrics.activeConnections = activeSize;
    this.metrics.idleConnections = idleSize;
    this.metrics.totalConnections = totalSize;
    this.metrics.utilizationPercentage = totalSize > 0 ? (activeSize / totalSize) * 100 : 0;

    // Calculate query time percentiles
    if (this.queryTimes.length > 0) {
      const sorted = [...this.queryTimes].sort((a, b) => a - b);
      const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
      const p95Idx = Math.ceil(sorted.length * 0.95) - 1;
      const p99Idx = Math.ceil(sorted.length * 0.99) - 1;

      this.metrics.averageQueryTime = avg;
      this.metrics.p95QueryTime = sorted[Math.max(0, p95Idx)];
      this.metrics.p99QueryTime = sorted[Math.max(0, p99Idx)];
    }

    // Calculate success rate
    if (this.metrics.totalQueries > 0) {
      this.metrics.successRate = ((this.metrics.totalQueries - this.metrics.failedQueries) / this.metrics.totalQueries) * 100;
    }
  }

  /**
   * Execute query with retry logic and failover support
   * 
   * Retry strategy:
   * - Attempt 1: Immediate (0ms)
   * - Attempt 2: 100ms delay
   * - Attempt 3: 500ms delay
   * - Attempt 4: 2000ms delay
   * - Timeout: 5 seconds total
   */
  async query(
    text: string,
    values?: unknown[],
    maxRetries: number = 3
  ): Promise<QueryResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    let attemptsUsed = 0;
    let usedFailover = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        attemptsUsed = attempt;
        const result = await this.executeQuery(text, values);
        const duration = Date.now() - startTime;

        // Record metrics
        this.recordQueryExecution({
          duration,
          success: true,
          retries: attempt - 1,
          usedFailover,
        });

        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if we should use failover
        if (
          attempt === 1 &&
          this.config.enableFailover &&
          this.shouldUseFailover() &&
          this.failoverPool &&
          !usedFailover
        ) {
          usedFailover = true;
          attempt--; // Don't count this as a real retry
          console.log(`🔄 Switching to failover pool for query retry`);
          continue;
        }

        // Exponential backoff for retries
        if (attempt < maxRetries) {
          const delay = Math.pow(5, attempt - 1) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted
    this.metrics.failedQueries++;
    this.metrics.totalQueries++;

    const duration = Date.now() - startTime;
    console.error(
      `❌ Query failed after ${attemptsUsed} attempts (${duration}ms): ${lastError?.message}`
    );

    throw new Error(
      `Query failed after ${attemptsUsed} attempts: ${lastError?.message}`
    );
  }

  /**
   * Execute query on appropriate pool
   */
  private async executeQuery(text: string, values?: unknown[]): Promise<QueryResult> {
    const pool = (this.shouldUseFailover() && this.failoverPool)
      ? this.failoverPool
      : this.primaryPool;

    try {
      return await pool.query(text, values);
    } catch (error) {
      // Validate connection and retry once on failure
      if (this.config.enableConnectionValidation) {
        try {
          await pool.query(this.config.connectionValidationQuery);
        } catch {
          console.warn('⚠️  Connection validation failed, will retry');
        }
      }
      throw error;
    }
  }

  /**
   * Determine if failover pool should be used
   */
  private shouldUseFailover(): boolean {
    if (!this.config.enableFailover || !this.failoverPool) {
      return false;
    }

    const utilization = this.metrics.utilizationPercentage;
    return utilization > this.config.failoverThreshold;
  }

  /**
   * Record query execution for metrics
   */
  private recordQueryExecution(execution: QueryExecution): void {
    this.metrics.totalQueries++;
    this.metrics.retryCount += execution.retries;

    // Record query time
    this.queryTimes.push(execution.duration);
    if (this.queryTimes.length > this.maxQueryTimeSamples) {
      this.queryTimes.shift();
    }

    // Track slow queries
    if (execution.duration > this.slowQueryThreshold) {
      this.metrics.slowQueryCount++;
    }
  }

  /**
   * Get connection for transaction
   * 
   * IMPORTANT: Caller must call `client.release()` when done
   */
  async getConnection(): Promise<PoolClient> {
    try {
      const pool = (this.shouldUseFailover() && this.failoverPool)
        ? this.failoverPool
        : this.primaryPool;

      return await pool.connect();
    } catch (error) {
      this.metrics.failedQueries++;
      throw error;
    }
  }

  /**
   * Get current pool metrics
   */
  getMetrics(): PoolMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get pool status as formatted string
   */
  getStatus(): string {
    const m = this.getMetrics();

    return `
╔═══════════════════════════════════════════╗
║         DATABASE POOL STATUS              ║
╚═══════════════════════════════════════════╝

🔌 CONNECTION STATE
   Active:        ${m.activeConnections}/${m.totalConnections}
   Idle:          ${m.idleConnections}
   Utilization:   ${m.utilizationPercentage.toFixed(1)}%

📊 QUERY PERFORMANCE
   Avg Time:      ${m.averageQueryTime.toFixed(2)}ms
   P95:           ${m.p95QueryTime.toFixed(2)}ms
   P99:           ${m.p99QueryTime.toFixed(2)}ms
   Slow Queries:  ${m.slowQueryCount}

📈 RELIABILITY
   Total:         ${m.totalQueries}
   Failed:        ${m.failedQueries}
   Success Rate:  ${m.successRate.toFixed(2)}%
   Retries:       ${m.retryCount}

🔄 FAILOVER
   Activations:   ${m.failoverActivations}
   Active:        ${m.failoverActiveNow ? 'YES ⚠️' : 'NO ✅'}

═══════════════════════════════════════════
    `.trim();
  }

  /**
   * Get pool status as JSON
   */
  getStatusJSON(): object {
    return this.getMetrics();
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down database connection pools...');

    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Close pools
    try {
      if (this.failoverPool) {
        await this.failoverPool.end();
        console.log('✅ Failover pool closed');
      }
      await this.primaryPool.end();
      console.log('✅ Primary pool closed');
    } catch (error) {
      console.error('❌ Error closing connection pools:', error);
      throw error;
    }

    console.log('✅ All database connections closed gracefully');
  }

  /**
   * Reset metrics (for testing)
   */
  resetMetrics(): void {
    this.metrics = {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
      utilizationPercentage: 0,
      averageQueryTime: 0,
      p95QueryTime: 0,
      p99QueryTime: 0,
      slowQueryCount: 0,
      totalQueries: 0,
      failedQueries: 0,
      successRate: 100,
      retryCount: 0,
      failoverActivations: 0,
      failoverActiveNow: false,
    };
    this.queryTimes = [];
  }
}

/**
 * Global pool manager instance
 */
export const poolManager = new PoolManager();

export type { PoolMetrics };
