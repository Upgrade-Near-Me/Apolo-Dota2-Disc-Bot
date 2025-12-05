// @ts-nocheck
/**
 * 📊 Prometheus Metrics Collector
 *
 * Centralized system for collecting and aggregating metrics from:
 * - Command handlers
 * - API services
 * - Job queues
 * - Database queries
 * - Redis operations
 * - Discord interactions
 *
 * Provides health checks and metric aggregation for dashboards
 */

import type { Pool, PoolClient } from 'pg';
import type { Redis } from 'ioredis';
import type { Queue, Worker } from 'bullmq';

/**
 * ========================================================================
 * METRIC INTERFACES
 * ========================================================================
 */

export interface CommandMetric {
  command: string;
  executions: number;
  successes: number;
  errors: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number; // 0-1
}

export interface ApiMetric {
  service: string;
  endpoint: string;
  requests: number;
  successes: number;
  errors: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  cacheHitRate: number; // 0-1
  rateLimitRemaining: number;
}

export interface JobQueueMetric {
  queue: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  avgProcessingMs: number;
  p95ProcessingMs: number;
  retryRate: number; // 0-1
}

export interface DatabaseMetric {
  table: string;
  queriesPerSecond: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  connectionPoolSize: number;
  connectionPoolIdle: number;
  errorRate: number; // 0-1
}

export interface CacheMetric {
  type: string;
  operations: number;
  hitRate: number; // 0-1
  avgLatencyMs: number;
}

export interface SystemHealth {
  bot: 'healthy' | 'degraded' | 'critical';
  database: 'healthy' | 'degraded' | 'critical';
  redis: 'healthy' | 'degraded' | 'critical';
  api: 'healthy' | 'degraded' | 'critical';
  discord: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
}

export interface PrometheusMetrics {
  // Timing data
  commandTimings: Map<string, number[]>; // command -> [latencies]
  apiTimings: Map<string, number[]>; // service:endpoint -> [latencies]
  jobTimings: Map<string, number[]>; // queue -> [processing times]
  dbTimings: Map<string, number[]>; // table:queryType -> [latencies]
  redisTimings: Map<string, number[]>; // operation -> [latencies]

  // Counter data
  commandCounts: Map<string, { total: number; success: number; error: number }>;
  apiCounts: Map<string, { total: number; success: number; error: number }>;
  jobCounts: Map<string, { total: number; completed: number; failed: number }>;
  redisCache: Map<string, { hits: number; misses: number }>;

  // Gauge data
  queueDepths: Map<string, number>;
  connectionPoolStats: { active: number; idle: number; waiting: number };
  redisMemory: number;
  discordPing: number;
}

/**
 * ========================================================================
 * METRICS COLLECTOR CLASS
 * ========================================================================
 */

export class MetricsCollector {
  private metrics: PrometheusMetrics = {
    commandTimings: new Map(),
    apiTimings: new Map(),
    jobTimings: new Map(),
    dbTimings: new Map(),
    redisTimings: new Map(),
    commandCounts: new Map(),
    apiCounts: new Map(),
    jobCounts: new Map(),
    redisCache: new Map(),
    queueDepths: new Map(),
    connectionPoolStats: { active: 0, idle: 0, waiting: 0 },
    redisMemory: 0,
    discordPing: 0,
  };

  private healthStatus: SystemHealth = {
    bot: 'healthy',
    database: 'healthy',
    redis: 'healthy',
    api: 'healthy',
    discord: 'healthy',
    timestamp: new Date(),
  };

  /**
   * Record command execution metric
   */
  recordCommandExecution(
    commandName: string,
    latencyMs: number,
    status: 'success' | 'error' = 'success'
  ): void {
    // Track timing
    if (!this.metrics.commandTimings.has(commandName)) {
      this.metrics.commandTimings.set(commandName, []);
    }
    this.metrics.commandTimings.get(commandName)!.push(latencyMs);

    // Track count
    if (!this.metrics.commandCounts.has(commandName)) {
      this.metrics.commandCounts.set(commandName, { total: 0, success: 0, error: 0 });
    }
    const count = this.metrics.commandCounts.get(commandName)!;
    count.total++;
    if (status === 'success') {
      count.success++;
    } else {
      count.error++;
    }
  }

  /**
   * Record API request metric
   */
  recordApiRequest(
    service: string,
    endpoint: string,
    latencyMs: number,
    status: number,
    cacheHit: boolean = false
  ): void {
    const key = `${service}:${endpoint}`;

    // Track timing
    if (!this.metrics.apiTimings.has(key)) {
      this.metrics.apiTimings.set(key, []);
    }
    this.metrics.apiTimings.get(key)!.push(latencyMs);

    // Track count
    if (!this.metrics.apiCounts.has(key)) {
      this.metrics.apiCounts.set(key, { total: 0, success: 0, error: 0 });
    }
    const count = this.metrics.apiCounts.get(key)!;
    count.total++;
    if (status === 200) {
      count.success++;
    } else {
      count.error++;
    }

    // Track cache
    if (!this.metrics.redisCache.has(service)) {
      this.metrics.redisCache.set(service, { hits: 0, misses: 0 });
    }
    const cache = this.metrics.redisCache.get(service)!;
    if (cacheHit) {
      cache.hits++;
    } else {
      cache.misses++;
    }
  }

  /**
   * Record job processing metric
   */
  recordJobProcessing(
    queueName: string,
    processingMs: number,
    status: 'completed' | 'failed' = 'completed'
  ): void {
    // Track timing
    if (!this.metrics.jobTimings.has(queueName)) {
      this.metrics.jobTimings.set(queueName, []);
    }
    this.metrics.jobTimings.get(queueName)!.push(processingMs);

    // Track count
    if (!this.metrics.jobCounts.has(queueName)) {
      this.metrics.jobCounts.set(queueName, { total: 0, completed: 0, failed: 0 });
    }
    const count = this.metrics.jobCounts.get(queueName)!;
    count.total++;
    if (status === 'completed') {
      count.completed++;
    } else {
      count.failed++;
    }
  }

  /**
   * Record database query metric
   */
  recordDbQuery(table: string, queryType: string, latencyMs: number, status: 'success' | 'error' = 'success'): void {
    const key = `${table}:${queryType}`;

    // Track timing
    if (!this.metrics.dbTimings.has(key)) {
      this.metrics.dbTimings.set(key, []);
    }
    this.metrics.dbTimings.get(key)!.push(latencyMs);
  }

  /**
   * Record Redis operation metric
   */
  recordRedisOperation(operation: string, latencyMs: number): void {
    if (!this.metrics.redisTimings.has(operation)) {
      this.metrics.redisTimings.set(operation, []);
    }
    this.metrics.redisTimings.get(operation)!.push(latencyMs);
  }

  /**
   * Update queue depth gauges
   */
  updateQueueDepth(queueName: string, depth: number): void {
    this.metrics.queueDepths.set(queueName, depth);
  }

  /**
   * Update connection pool stats
   */
  updateConnectionPoolStats(active: number, idle: number, waiting: number): void {
    this.metrics.connectionPoolStats = { active, idle, waiting };
  }

  /**
   * Update Redis memory
   */
  updateRedisMemory(bytes: number): void {
    this.metrics.redisMemory = bytes;
  }

  /**
   * Update Discord gateway ping
   */
  updateDiscordPing(ms: number): void {
    this.metrics.discordPing = ms;
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get aggregated command metrics
   */
  getCommandMetrics(): CommandMetric[] {
    const results: CommandMetric[] = [];

    for (const [command, timings] of this.metrics.commandTimings.entries()) {
      const count = this.metrics.commandCounts.get(command)!;
      results.push({
        command,
        executions: count.total,
        successes: count.success,
        errors: count.error,
        avgLatencyMs: timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0,
        p95LatencyMs: this.calculatePercentile(timings, 95),
        p99LatencyMs: this.calculatePercentile(timings, 99),
        errorRate: count.total > 0 ? count.error / count.total : 0,
      });
    }

    return results;
  }

  /**
   * Get aggregated API metrics
   */
  getApiMetrics(): ApiMetric[] {
    const results: ApiMetric[] = [];

    for (const [key, timings] of this.metrics.apiTimings.entries()) {
      const parts = key.split(':');
      const service = parts[0] ?? 'unknown';
      const endpoint = parts[1] ?? 'unknown';
      const count = this.metrics.apiCounts.get(key)!;
      const cache = this.metrics.redisCache.get(service) || { hits: 0, misses: 0 };

      results.push({
        service,
        endpoint,
        requests: count.total,
        successes: count.success,
        errors: count.error,
        avgLatencyMs: timings.length > 0 ? timings.reduce((a: number, b: number) => a + b, 0) / timings.length : 0,
        p95LatencyMs: this.calculatePercentile(timings, 95),
        cacheHitRate: cache.hits + cache.misses > 0 ? cache.hits / (cache.hits + cache.misses) : 0,
        rateLimitRemaining: 0, // Would be updated by rate limit tracker
      });
    }

    return results;
  }

  /**
   * Get aggregated job queue metrics
   */
  getJobQueueMetrics(): JobQueueMetric[] {
    const results: JobQueueMetric[] = [];

    for (const [queue, timings] of this.metrics.jobTimings.entries()) {
      const count = this.metrics.jobCounts.get(queue)!;

      results.push({
        queue,
        waiting: this.metrics.queueDepths.get(queue) || 0,
        active: 0, // Would be tracked separately
        completed: count.completed,
        failed: count.failed,
        avgProcessingMs: timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0,
        p95ProcessingMs: this.calculatePercentile(timings, 95),
        retryRate: count.total > 0 ? count.failed / count.total : 0,
      });
    }

    return results;
  }

  /**
   * Get system health status
   */
  getHealthStatus(): SystemHealth {
    return { ...this.healthStatus };
  }

  /**
   * Update health status for a component
   */
  setHealthStatus(component: keyof SystemHealth, status: 'healthy' | 'degraded' | 'critical'): void {
    if (component !== 'timestamp') {
      this.healthStatus[component] = status;
    }
    this.healthStatus.timestamp = new Date();
  }

  /**
   * Check overall system health
   */
  checkSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    const components = Object.values(this.healthStatus).filter((v) => v !== this.healthStatus.timestamp);
    const unhealthy = components.filter((c) => c !== 'healthy').length;

    if (unhealthy === 0) return 'healthy';
    if (unhealthy >= 2) return 'critical';
    return 'degraded';
  }

  /**
   * Reset metrics (for testing or periodic purge)
   */
  reset(): void {
    this.metrics = {
      commandTimings: new Map(),
      apiTimings: new Map(),
      jobTimings: new Map(),
      dbTimings: new Map(),
      redisTimings: new Map(),
      commandCounts: new Map(),
      apiCounts: new Map(),
      jobCounts: new Map(),
      redisCache: new Map(),
      queueDepths: new Map(),
      connectionPoolStats: { active: 0, idle: 0, waiting: 0 },
      redisMemory: 0,
      discordPing: 0,
    };
  }

  /**
   * Get metrics summary for export
   */
  getSummary() {
    return {
      commands: this.getCommandMetrics(),
      apis: this.getApiMetrics(),
      queues: this.getJobQueueMetrics(),
      health: this.getHealthStatus(),
      timestamp: new Date(),
    };
  }
}

/**
 * Global metrics collector instance
 */
export const metricsCollector = new MetricsCollector();

export default metricsCollector;
