/**
 * 📊 Phase 16: Prometheus Metrics System
 *
 * Enterprise-grade production monitoring for:
 * - Command execution latency (p50, p95, p99)
 * - API response times by service (Stratz, Steam, OpenDota, Gemini)
 * - Error rates and error types
 * - Job queue depths and processing times
 * - Database query latency and connection pool stats
 * - Redis cache hit/miss rates
 * - Discord interaction latency
 * - Custom business metrics (matches analyzed, players ranked, teams balanced)
 *
 * Metrics exported in Prometheus format (port 9090)
 * Grafana dashboard ready with alert rules
 */

import promClient from 'prom-client';
import logger from '../utils/logger.js';

/**
 * ========================================================================
 * METRICS REGISTRY & INITIALIZATION
 * ========================================================================
 */

// Create isolated registry for metrics
export const metricsRegistry = new promClient.Registry();

// Default metrics (CPU, memory, Node.js internals)
promClient.collectDefaultMetrics({ register: metricsRegistry });

/**
 * ========================================================================
 * SECTION 1: COMMAND EXECUTION METRICS (4 metrics)
 * ========================================================================
 */

/**
 * Command execution latency (milliseconds)
 * Labels: command_name, status (success/error)
 */
export const commandDurationMs = new promClient.Histogram({
  name: 'apolo_command_duration_ms',
  help: 'Command execution latency in milliseconds',
  labelNames: ['command_name', 'status'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [metricsRegistry],
});

/**
 * Command execution counter
 * Labels: command_name, status (success/error/timeout)
 */
export const commandExecutions = new promClient.Counter({
  name: 'apolo_commands_total',
  help: 'Total number of command executions',
  labelNames: ['command_name', 'status'],
  registers: [metricsRegistry],
});

/**
 * Commands in progress (gauge)
 * Labels: command_name
 */
export const commandsInProgress = new promClient.Gauge({
  name: 'apolo_commands_in_progress',
  help: 'Number of commands currently being executed',
  labelNames: ['command_name'],
  registers: [metricsRegistry],
});

/**
 * Command error rates by type
 * Labels: command_name, error_type
 */
export const commandErrors = new promClient.Counter({
  name: 'apolo_command_errors_total',
  help: 'Total number of command errors by type',
  labelNames: ['command_name', 'error_type'],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 2: API SERVICE METRICS (5 metrics)
 * ========================================================================
 */

/**
 * API request latency by service
 * Labels: service (stratz/steam/opendota/gemini), endpoint, status
 */
export const apiRequestDurationMs = new promClient.Histogram({
  name: 'apolo_api_request_duration_ms',
  help: 'API request latency in milliseconds by service',
  labelNames: ['service', 'endpoint', 'status'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
  registers: [metricsRegistry],
});

/**
 * API request counter
 * Labels: service, endpoint, status (200/400/401/403/429/500)
 */
export const apiRequests = new promClient.Counter({
  name: 'apolo_api_requests_total',
  help: 'Total API requests by service and status',
  labelNames: ['service', 'endpoint', 'status'],
  registers: [metricsRegistry],
});

/**
 * API rate limit remaining
 * Labels: service
 */
export const apiRateLimitRemaining = new promClient.Gauge({
  name: 'apolo_api_rate_limit_remaining',
  help: 'API rate limit requests remaining',
  labelNames: ['service'],
  registers: [metricsRegistry],
});

/**
 * API errors by service
 * Labels: service, error_type (timeout/auth/ratelimit/server)
 */
export const apiErrors = new promClient.Counter({
  name: 'apolo_api_errors_total',
  help: 'Total API errors by service and type',
  labelNames: ['service', 'error_type'],
  registers: [metricsRegistry],
});

/**
 * API cache hit rate
 * Labels: service, cache_status (hit/miss)
 */
export const apiCacheHits = new promClient.Counter({
  name: 'apolo_api_cache_total',
  help: 'API cache hits and misses',
  labelNames: ['service', 'cache_status'],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 3: JOB QUEUE METRICS (5 metrics)
 * ========================================================================
 */

/**
 * Job processing latency
 * Labels: queue_name, status (completed/failed/stalled)
 */
export const jobProcessingDurationMs = new promClient.Histogram({
  name: 'apolo_job_processing_duration_ms',
  help: 'Job processing latency in milliseconds by queue',
  labelNames: ['queue_name', 'status'],
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000],
  registers: [metricsRegistry],
});

/**
 * Queue depth (jobs waiting)
 * Labels: queue_name
 */
export const queueDepth = new promClient.Gauge({
  name: 'apolo_queue_depth',
  help: 'Number of jobs waiting in queue',
  labelNames: ['queue_name'],
  registers: [metricsRegistry],
});

/**
 * Jobs processed counter
 * Labels: queue_name, status (completed/failed/retried)
 */
export const jobsProcessed = new promClient.Counter({
  name: 'apolo_jobs_processed_total',
  help: 'Total jobs processed by queue',
  labelNames: ['queue_name', 'status'],
  registers: [metricsRegistry],
});

/**
 * Active workers per queue
 * Labels: queue_name
 */
export const activeWorkers = new promClient.Gauge({
  name: 'apolo_active_workers',
  help: 'Number of active workers per queue',
  labelNames: ['queue_name'],
  registers: [metricsRegistry],
});

/**
 * Job retry attempts
 * Labels: queue_name, attempt_number
 */
export const jobRetries = new promClient.Counter({
  name: 'apolo_job_retries_total',
  help: 'Total job retries by queue',
  labelNames: ['queue_name', 'attempt_number'],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 4: DATABASE METRICS (4 metrics)
 * ========================================================================
 */

/**
 * Database query latency
 * Labels: query_type (select/insert/update/delete), table, status
 */
export const dbQueryDurationMs = new promClient.Histogram({
  name: 'apolo_db_query_duration_ms',
  help: 'Database query latency in milliseconds',
  labelNames: ['query_type', 'table', 'status'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
  registers: [metricsRegistry],
});

/**
 * Query counter
 * Labels: query_type, table, status
 */
export const dbQueries = new promClient.Counter({
  name: 'apolo_db_queries_total',
  help: 'Total database queries',
  labelNames: ['query_type', 'table', 'status'],
  registers: [metricsRegistry],
});

/**
 * Connection pool size
 * Labels: pool_type (active/idle/waiting)
 */
export const dbPoolConnections = new promClient.Gauge({
  name: 'apolo_db_pool_connections',
  help: 'Database connection pool size',
  labelNames: ['pool_type'],
  registers: [metricsRegistry],
});

/**
 * Connection pool wait time
 * Labels: (none)
 */
export const dbPoolWaitTimeMs = new promClient.Histogram({
  name: 'apolo_db_pool_wait_time_ms',
  help: 'Time waiting for available database connection',
  buckets: [1, 5, 10, 25, 50, 100, 250, 500],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 5: REDIS/CACHE METRICS (4 metrics)
 * ========================================================================
 */

/**
 * Redis operation latency
 * Labels: operation (get/set/del/hget/hset), status
 */
export const redisOperationDurationMs = new promClient.Histogram({
  name: 'apolo_redis_operation_duration_ms',
  help: 'Redis operation latency in milliseconds',
  labelNames: ['operation', 'status'],
  buckets: [0.1, 0.5, 1, 5, 10, 25, 50, 100, 250],
  registers: [metricsRegistry],
});

/**
 * Redis operations counter
 * Labels: operation, status (success/error/timeout)
 */
export const redisOperations = new promClient.Counter({
  name: 'apolo_redis_operations_total',
  help: 'Total Redis operations',
  labelNames: ['operation', 'status'],
  registers: [metricsRegistry],
});

/**
 * Cache hit ratio
 * Labels: cache_type (profile/match/build/hero/etc)
 */
export const cacheHitRatio = new promClient.Gauge({
  name: 'apolo_cache_hit_ratio',
  help: 'Cache hit ratio by type (0-1)',
  labelNames: ['cache_type'],
  registers: [metricsRegistry],
});

/**
 * Redis memory usage
 * Labels: (none)
 */
export const redisMemoryBytes = new promClient.Gauge({
  name: 'apolo_redis_memory_bytes',
  help: 'Redis memory usage in bytes',
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 6: DISCORD INTERACTION METRICS (3 metrics)
 * ========================================================================
 */

/**
 * Discord interaction latency (time to initial response)
 * Labels: interaction_type (command/button/modal), status
 */
export const discordInteractionDurationMs = new promClient.Histogram({
  name: 'apolo_discord_interaction_duration_ms',
  help: 'Discord interaction response latency in milliseconds',
  labelNames: ['interaction_type', 'status'],
  buckets: [100, 250, 500, 1000, 2000, 3000],
  registers: [metricsRegistry],
});

/**
 * Discord interactions processed
 * Labels: interaction_type, status (success/error/timeout)
 */
export const discordInteractions = new promClient.Counter({
  name: 'apolo_discord_interactions_total',
  help: 'Total Discord interactions processed',
  labelNames: ['interaction_type', 'status'],
  registers: [metricsRegistry],
});

/**
 * Discord gateway latency
 * Labels: (none)
 */
export const discordGatewayPingMs = new promClient.Gauge({
  name: 'apolo_discord_gateway_ping_ms',
  help: 'Discord gateway ping in milliseconds',
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 7: BUSINESS METRICS (5 metrics)
 * ========================================================================
 */

/**
 * Matches analyzed
 * Labels: (none)
 */
export const matchesAnalyzed = new promClient.Counter({
  name: 'apolo_matches_analyzed_total',
  help: 'Total matches analyzed',
  registers: [metricsRegistry],
});

/**
 * Players ranked (in all servers)
 * Labels: (none)
 */
export const playersRanked = new promClient.Counter({
  name: 'apolo_players_ranked_total',
  help: 'Total players ranked',
  registers: [metricsRegistry],
});

/**
 * Teams balanced
 * Labels: (none)
 */
export const teamsBalanced = new promClient.Counter({
  name: 'apolo_teams_balanced_total',
  help: 'Total teams balanced',
  registers: [metricsRegistry],
});

/**
 * AI analysis requests
 * Labels: analysis_type (performance/trends/weaknesses/strengths/heroes/report/compare/tips)
 */
export const aiAnalysisRequests = new promClient.Counter({
  name: 'apolo_ai_analysis_requests_total',
  help: 'Total AI analysis requests by type',
  labelNames: ['analysis_type'],
  registers: [metricsRegistry],
});

/**
 * Steam account connections
 * Labels: status (new/verified/failed)
 */
export const steamConnections = new promClient.Counter({
  name: 'apolo_steam_connections_total',
  help: 'Total Steam account connections',
  labelNames: ['status'],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * SECTION 8: SYSTEM HEALTH METRICS (3 metrics)
 * ========================================================================
 */

/**
 * Bot uptime (gauge - reset on restart)
 * Labels: (none)
 */
export const botUptimeSeconds = new promClient.Gauge({
  name: 'apolo_bot_uptime_seconds',
  help: 'Bot uptime in seconds',
  registers: [metricsRegistry],
});

/**
 * Healthy status
 * Labels: component (bot/database/redis/api)
 */
export const healthStatus = new promClient.Gauge({
  name: 'apolo_health_status',
  help: 'Component health status (1=healthy, 0=unhealthy)',
  labelNames: ['component'],
  registers: [metricsRegistry],
});

/**
 * Error rate (% of operations)
 * Labels: component (command/api/db/redis/discord)
 */
export const errorRate = new promClient.Gauge({
  name: 'apolo_error_rate_percent',
  help: 'Error rate as percentage',
  labelNames: ['component'],
  registers: [metricsRegistry],
});

/**
 * ========================================================================
 * HELPER FUNCTIONS FOR METRICS
 * ========================================================================
 */

/**
 * Track command execution with automatic error handling
 */
export function trackCommand(commandName: string, fn: () => Promise<void>) {
  return async () => {
    const timer = commandDurationMs.startTimer({ command_name: commandName });
    commandsInProgress.inc({ command_name: commandName });
    commandExecutions.inc({ command_name: commandName, status: 'started' });

    try {
      await fn();
      commandExecutions.inc({ command_name: commandName, status: 'success' });
      timer({ status: 'success' });
    } catch (error: any) {
      const errorType = error?.name || 'unknown';
      commandErrors.inc({ command_name: commandName, error_type: errorType });
      commandExecutions.inc({ command_name: commandName, status: 'error' });
      timer({ status: 'error' });
      throw error;
    } finally {
      commandsInProgress.dec({ command_name: commandName });
    }
  };
}

/**
 * Track API request with latency and status
 */
export function trackApiRequest(service: string, endpoint: string) {
  return {
    start: () => apiRequestDurationMs.startTimer({ service, endpoint, status: '200' }),
    recordSuccess: (timer: any) => {
      apiRequests.inc({ service, endpoint, status: '200' });
      timer({ status: '200' });
    },
    recordError: (timer: any, status: number) => {
      apiRequests.inc({ service, endpoint, status: status.toString() });
      apiErrors.inc({ service, error_type: 'http_error' });
      timer({ status: status.toString() });
    },
    recordTimeout: (timer: any) => {
      apiErrors.inc({ service, error_type: 'timeout' });
      timer({ status: 'timeout' });
    },
    recordRateLimit: () => {
      apiErrors.inc({ service, error_type: 'ratelimit' });
      apiRequests.inc({ service, endpoint, status: '429' });
    },
  };
}

/**
 * Track job processing
 */
export function trackJobProcessing(queueName: string) {
  return {
    start: () => jobProcessingDurationMs.startTimer({ queue_name: queueName, status: 'completed' }),
    recordCompleted: (timer: any) => {
      jobsProcessed.inc({ queue_name: queueName, status: 'completed' });
      timer({ status: 'completed' });
    },
    recordFailed: (timer: any) => {
      jobsProcessed.inc({ queue_name: queueName, status: 'failed' });
      timer({ status: 'failed' });
    },
    recordRetry: (attemptNumber: number) => {
      jobRetries.inc({ queue_name: queueName, attempt_number: attemptNumber.toString() });
    },
  };
}

/**
 * Track database query
 */
export function trackDbQuery(queryType: string, table: string) {
  return {
    start: () => dbQueryDurationMs.startTimer({ query_type: queryType, table, status: 'success' }),
    recordSuccess: (timer: any) => {
      dbQueries.inc({ query_type: queryType, table, status: 'success' });
      timer({ status: 'success' });
    },
    recordError: (timer: any) => {
      dbQueries.inc({ query_type: queryType, table, status: 'error' });
      timer({ status: 'error' });
    },
  };
}

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  try {
    return await metricsRegistry.metrics();
  } catch (error: any) {
    logger.error({
      event: 'metrics_export_failed',
      error: error.message,
    });
    return '';
  }
}

/**
 * Export all metrics for external use
 */
export default {
  // Section 1: Commands
  commandDurationMs,
  commandExecutions,
  commandsInProgress,
  commandErrors,

  // Section 2: APIs
  apiRequestDurationMs,
  apiRequests,
  apiRateLimitRemaining,
  apiErrors,
  apiCacheHits,

  // Section 3: Job Queues
  jobProcessingDurationMs,
  queueDepth,
  jobsProcessed,
  activeWorkers,
  jobRetries,

  // Section 4: Database
  dbQueryDurationMs,
  dbQueries,
  dbPoolConnections,
  dbPoolWaitTimeMs,

  // Section 5: Redis/Cache
  redisOperationDurationMs,
  redisOperations,
  cacheHitRatio,
  redisMemoryBytes,

  // Section 6: Discord
  discordInteractionDurationMs,
  discordInteractions,
  discordGatewayPingMs,

  // Section 7: Business
  matchesAnalyzed,
  playersRanked,
  teamsBalanced,
  aiAnalysisRequests,
  steamConnections,

  // Section 8: System Health
  botUptimeSeconds,
  healthStatus,
  errorRate,

  // Helpers
  getMetrics,
  metricsRegistry,
};
