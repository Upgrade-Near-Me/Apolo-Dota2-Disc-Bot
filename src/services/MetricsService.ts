/**
 * Prometheus Metrics Service
 * 
 * Provides comprehensive monitoring metrics for commercial demonstration:
 * - Command execution tracking (count, duration, success/failure rate)
 * - API latency monitoring (Stratz, OpenDota, Steam, Gemini)
 * - Database query performance
 * - Redis cache hit/miss rates
 * - Discord.js client metrics (guilds, users, events)
 * - Error tracking by type and service
 * 
 * Metrics exposed on /metrics endpoint for Prometheus scraping.
 * 
 * @module MetricsService
 */

import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// ============================================================================
// Default Metrics Collection
// ============================================================================

/**
 * Enable default Node.js metrics (memory, CPU, event loop lag, etc.)
 * Interval: 10 seconds
 */
collectDefaultMetrics({ 
  register,
  prefix: 'apolo_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ============================================================================
// Command Metrics
// ============================================================================

/**
 * Total number of Discord commands executed
 * 
 * Labels:
 * - command: Command name (dashboard, balance, ai-coach, etc.)
 * - status: success | error
 * - guild_id: Discord server ID
 */
export const commandCounter = new Counter({
  name: 'apolo_commands_total',
  help: 'Total number of Discord commands executed',
  labelNames: ['command', 'status', 'guild_id'],
  registers: [register]
});

/**
 * Command execution duration histogram
 * 
 * Buckets: 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s
 * Labels:
 * - command: Command name
 */
export const commandDurationHistogram = new Histogram({
  name: 'apolo_command_duration_seconds',
  help: 'Command execution duration in seconds',
  labelNames: ['command'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

// ============================================================================
// API Latency Metrics
// ============================================================================

/**
 * External API request duration histogram
 * 
 * Buckets: 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s
 * Labels:
 * - service: stratz | opendota | steam | gemini
 * - endpoint: API endpoint name
 * - status: success | error | timeout
 */
export const apiLatencyHistogram = new Histogram({
  name: 'apolo_api_latency_seconds',
  help: 'External API request duration in seconds',
  labelNames: ['service', 'endpoint', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

/**
 * API request counter
 * 
 * Labels:
 * - service: API service name
 * - endpoint: API endpoint name
 * - status_code: HTTP status code
 */
export const apiRequestCounter = new Counter({
  name: 'apolo_api_requests_total',
  help: 'Total number of external API requests',
  labelNames: ['service', 'endpoint', 'status_code'],
  registers: [register]
});

/**
 * API rate limit events counter
 * 
 * Labels:
 * - service: API service name
 * - action: throttled | rejected | fallback
 */
export const apiRateLimitCounter = new Counter({
  name: 'apolo_api_rate_limits_total',
  help: 'Total API rate limit events',
  labelNames: ['service', 'action'],
  registers: [register]
});

// ============================================================================
// Database Metrics
// ============================================================================

/**
 * Database query duration histogram
 * 
 * Buckets: 1ms, 5ms, 10ms, 50ms, 100ms, 500ms, 1s, 5s
 * Labels:
 * - operation: SELECT | INSERT | UPDATE | DELETE
 * - table: Database table name
 */
export const dbQueryHistogram = new Histogram({
  name: 'apolo_db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

/**
 * Database connection pool metrics
 * 
 * Gauge for current pool state:
 * - total: Total connections
 * - idle: Available connections
 * - waiting: Pending requests
 */
export const dbPoolGauge = new Gauge({
  name: 'apolo_db_pool_connections',
  help: 'Database connection pool state',
  labelNames: ['state'],
  registers: [register]
});

/**
 * Database error counter
 * 
 * Labels:
 * - type: connection_timeout | query_error | deadlock
 */
export const dbErrorCounter = new Counter({
  name: 'apolo_db_errors_total',
  help: 'Total database errors',
  labelNames: ['type'],
  registers: [register]
});

// ============================================================================
// Redis Metrics
// ============================================================================

/**
 * Redis cache hit/miss counter
 * 
 * Labels:
 * - operation: get | set | delete
 * - result: hit | miss | error
 * - key_prefix: Cache key prefix (stratz, opendota, etc.)
 */
export const redisCacheCounter = new Counter({
  name: 'apolo_redis_cache_operations_total',
  help: 'Total Redis cache operations',
  labelNames: ['operation', 'result', 'key_prefix'],
  registers: [register]
});

/**
 * Redis operation duration histogram
 * 
 * Buckets: 1ms, 5ms, 10ms, 25ms, 50ms, 100ms, 500ms
 * Labels:
 * - operation: get | set | delete | expire
 */
export const redisLatencyHistogram = new Histogram({
  name: 'apolo_redis_operation_duration_seconds',
  help: 'Redis operation duration in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.5],
  registers: [register]
});

/**
 * Redis connection state gauge
 * 
 * Values: 1 (connected), 0 (disconnected)
 */
export const redisConnectionGauge = new Gauge({
  name: 'apolo_redis_connected',
  help: 'Redis connection state (1=connected, 0=disconnected)',
  registers: [register]
});

// ============================================================================
// Discord Client Metrics
// ============================================================================

/**
 * Active Discord guilds gauge
 */
export const discordGuildsGauge = new Gauge({
  name: 'apolo_discord_guilds_total',
  help: 'Total number of Discord guilds (servers)',
  registers: [register]
});

/**
 * Active Discord users gauge
 */
export const discordUsersGauge = new Gauge({
  name: 'apolo_discord_users_total',
  help: 'Total number of Discord users across all guilds',
  registers: [register]
});

/**
 * Discord events counter
 * 
 * Labels:
 * - event: messageCreate | interactionCreate | guildCreate | etc.
 */
export const discordEventsCounter = new Counter({
  name: 'apolo_discord_events_total',
  help: 'Total Discord.js events received',
  labelNames: ['event'],
  registers: [register]
});

/**
 * Discord API errors counter
 * 
 * Labels:
 * - error_code: HTTP error code (50001, 50013, etc.)
 * - error_type: MissingPermissions | UnknownInteraction | etc.
 */
export const discordErrorsCounter = new Counter({
  name: 'apolo_discord_errors_total',
  help: 'Total Discord API errors',
  labelNames: ['error_code', 'error_type'],
  registers: [register]
});

// ============================================================================
// Business Metrics
// ============================================================================

/**
 * Steam account connections counter
 * 
 * Labels:
 * - status: connected | disconnected | failed
 */
export const steamConnectionsCounter = new Counter({
  name: 'apolo_steam_connections_total',
  help: 'Total Steam account connection attempts',
  labelNames: ['status'],
  registers: [register]
});

/**
 * Team balancer usage counter
 * 
 * Labels:
 * - players: Number of players balanced (2-10)
 * - status: success | error
 */
export const teamBalancerCounter = new Counter({
  name: 'apolo_team_balancer_total',
  help: 'Total team balancer uses',
  labelNames: ['players', 'status'],
  registers: [register]
});

/**
 * AI coach requests counter
 * 
 * Labels:
 * - analysis_type: performance | trends | weaknesses | strengths | etc.
 * - locale: en | pt | es
 * - status: success | error | rate_limited
 */
export const aiCoachCounter = new Counter({
  name: 'apolo_ai_coach_requests_total',
  help: 'Total AI coach analysis requests',
  labelNames: ['analysis_type', 'locale', 'status'],
  registers: [register]
});

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Application errors counter
 * 
 * Labels:
 * - service: Service/module name
 * - error_type: Error class name
 * - severity: low | medium | high | critical
 */
export const errorCounter = new Counter({
  name: 'apolo_errors_total',
  help: 'Total application errors',
  labelNames: ['service', 'error_type', 'severity'],
  registers: [register]
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get metrics in Prometheus format
 * 
 * @returns {Promise<string>} Prometheus-formatted metrics
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}

/**
 * Get content type for metrics response
 * 
 * @returns {string} Content-Type header value
 */
export function getContentType(): string {
  return register.contentType;
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  register.resetMetrics();
}

/**
 * Track command execution with automatic timing
 * 
 * @param command - Command name
 * @param guildId - Discord guild ID
 * @param fn - Async function to execute
 * @returns {Promise<T>} Function result
 * 
 * @example
 * ```typescript
 * await trackCommand('dashboard', guildId, async () => {
 *   // Command logic here
 * });
 * ```
 */
export async function trackCommand<T>(
  command: string,
  guildId: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = commandDurationHistogram.startTimer({ command });
  
  try {
    const result = await fn();
    commandCounter.inc({ command, status: 'success', guild_id: guildId });
    return result;
  } catch (error) {
    commandCounter.inc({ command, status: 'error', guild_id: guildId });
    throw error;
  } finally {
    end();
  }
}

/**
 * Track API request with automatic timing
 * 
 * @param service - API service name
 * @param endpoint - API endpoint name
 * @param fn - Async function to execute
 * @returns {Promise<T>} Function result
 * 
 * @example
 * ```typescript
 * const profile = await trackApiRequest('stratz', 'getPlayerProfile', async () => {
 *   return await stratzService.getPlayerProfile(steamId);
 * });
 * ```
 */
export async function trackApiRequest<T>(
  service: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = apiLatencyHistogram.startTimer({ service, endpoint, status: 'success' });
  
  try {
    const result = await fn();
    apiRequestCounter.inc({ service, endpoint, status_code: '200' });
    return result;
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || '500';
    apiRequestCounter.inc({ service, endpoint, status_code: statusCode.toString() });
    
    if (statusCode === 429) {
      apiRateLimitCounter.inc({ service, action: 'throttled' });
    }
    
    throw error;
  } finally {
    end();
  }
}

/**
 * Track database query with automatic timing
 * 
 * @param operation - SQL operation (SELECT, INSERT, UPDATE, DELETE)
 * @param table - Database table name
 * @param fn - Async function to execute
 * @returns {Promise<T>} Function result
 * 
 * @example
 * ```typescript
 * const users = await trackDbQuery('SELECT', 'users', async () => {
 *   return await pool.query('SELECT * FROM users WHERE discord_id = $1', [discordId]);
 * });
 * ```
 */
export async function trackDbQuery<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = dbQueryHistogram.startTimer({ operation, table });
  
  try {
    return await fn();
  } catch (error: any) {
    const errorType = error.code === '57014' ? 'query_timeout' :
                      error.code === '40P01' ? 'deadlock' :
                      'query_error';
    dbErrorCounter.inc({ type: errorType });
    throw error;
  } finally {
    end();
  }
}

/**
 * Track Redis operation with automatic timing
 * 
 * @param operation - Redis operation (get, set, delete, expire)
 * @param keyPrefix - Cache key prefix
 * @param fn - Async function to execute
 * @returns {Promise<T>} Function result
 * 
 * @example
 * ```typescript
 * const cached = await trackRedisOperation('get', 'stratz', async () => {
 *   return await redis.get(`stratz:profile:${steamId}`);
 * });
 * ```
 */
export async function trackRedisOperation<T>(
  operation: string,
  keyPrefix: string,
  fn: () => Promise<T>
): Promise<T> {
  const end = redisLatencyHistogram.startTimer({ operation });
  
  try {
    const result = await fn();
    
    if (operation === 'get') {
      const resultType = result !== null ? 'hit' : 'miss';
      redisCacheCounter.inc({ operation, result: resultType, key_prefix: keyPrefix });
    } else {
      redisCacheCounter.inc({ operation, result: 'success', key_prefix: keyPrefix });
    }
    
    return result;
  } catch (error) {
    redisCacheCounter.inc({ operation, result: 'error', key_prefix: keyPrefix });
    throw error;
  } finally {
    end();
  }
}

/**
 * Update Discord client metrics (call periodically)
 * 
 * @param guildsCount - Number of guilds
 * @param usersCount - Number of users
 */
export function updateDiscordMetrics(guildsCount: number, usersCount: number): void {
  discordGuildsGauge.set(guildsCount);
  discordUsersGauge.set(usersCount);
}

/**
 * Update database pool metrics (call periodically)
 * 
 * @param total - Total connections
 * @param idle - Idle connections
 * @param waiting - Waiting requests
 */
export function updateDbPoolMetrics(total: number, idle: number, waiting: number): void {
  dbPoolGauge.set({ state: 'total' }, total);
  dbPoolGauge.set({ state: 'idle' }, idle);
  dbPoolGauge.set({ state: 'waiting' }, waiting);
}

/**
 * Update Redis connection state
 * 
 * @param connected - Connection state (true/false)
 */
export function updateRedisConnectionState(connected: boolean): void {
  redisConnectionGauge.set(connected ? 1 : 0);
}
