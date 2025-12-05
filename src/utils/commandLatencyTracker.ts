/**
 * Command Latency Tracking Wrapper
 * 
 * Wraps all command executions to automatically track:
 * - Execution duration
 * - Success/failure status
 * - Command name and guild ID
 * - Prometheus metrics
 * - Performance alerts
 * 
 * @module CommandLatencyTracker
 */

import { ChatInputCommandInteraction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import {
  trackCommand,
  errorCounter
} from '../services/MetricsService.js';
import logger from './logger.js';

/**
 * Interaction type union
 */
type InteractionType = ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction;

/**
 * Performance thresholds for alerts
 */
const PERFORMANCE_THRESHOLDS = {
  warning: 2.5,    // Yellow warning at 2.5s
  critical: 5.0,   // Red alert at 5s
};

/**
 * Track command execution with latency monitoring
 * 
 * @param commandName - Command or button ID
 * @param guildId - Discord guild ID
 * @param executeFn - Async function to execute
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * await trackCommandLatency('dashboard', interaction.guildId, async () => {
 *   await handleDashboard(interaction);
 * });
 * ```
 */
export async function trackCommandLatency(
  commandName: string,
  guildId: string | null | undefined,
  executeFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  const finalGuildId = guildId || 'unknown';
  
  try {
    // Execute command with timing
    await trackCommand(commandName, finalGuildId, executeFn);
    
    // Calculate duration
    const durationMs = Date.now() - startTime;
    const durationS = durationMs / 1000;
    
    // Log performance data
    logger.info({
      event: 'command_executed',
      command: commandName,
      guild_id: finalGuildId,
      duration_ms: durationMs,
      duration_s: durationS.toFixed(3),
      status: 'success'
    }, `✅ Command executed: ${commandName} (${durationS.toFixed(3)}s)`);
    
    // Alert if exceeds thresholds
    if (durationS > PERFORMANCE_THRESHOLDS.critical) {
      logger.warn({
        event: 'command_slow_critical',
        command: commandName,
        duration_s: durationS.toFixed(3),
        threshold_s: PERFORMANCE_THRESHOLDS.critical
      }, `🔴 CRITICAL: Command ${commandName} took ${durationS.toFixed(3)}s (>${PERFORMANCE_THRESHOLDS.critical}s)`);
    } else if (durationS > PERFORMANCE_THRESHOLDS.warning) {
      logger.warn({
        event: 'command_slow_warning',
        command: commandName,
        duration_s: durationS.toFixed(3),
        threshold_s: PERFORMANCE_THRESHOLDS.warning
      }, `🟡 SLOW: Command ${commandName} took ${durationS.toFixed(3)}s (>${PERFORMANCE_THRESHOLDS.warning}s)`);
    }
    
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const durationS = durationMs / 1000;
    
    // Log error
    logger.error({
      event: 'command_failed',
      command: commandName,
      guild_id: finalGuildId,
      duration_ms: durationMs,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, `❌ Command failed: ${commandName} after ${durationS.toFixed(3)}s`);
    
    // Track error metric
    const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';
    errorCounter.inc({ 
      service: 'command_handler',
      error_type: errorType,
      severity: 'high'
    });
    
    throw error;
  }
}

/**
 * Get command performance statistics
 * 
 * @returns {Object} Performance metrics
 */
export function getCommandPerformanceStats() {
  return {
    thresholds: PERFORMANCE_THRESHOLDS,
    timestamp: new Date().toISOString(),
    note: 'Use Prometheus queries to analyze detailed metrics'
  };
}

/**
 * Create latency tracker for interaction (command/button/modal)
 * 
 * @param interaction - Discord interaction
 * @returns {Object} Tracker object with timing info
 * 
 * @example
 * ```typescript
 * const tracker = createInteractionTracker(interaction);
 * try {
 *   await doWork();
 * } finally {
 *   tracker.end('success');
 * }
 * ```
 */
export function createInteractionTracker(interaction: InteractionType) {
  const startTime = Date.now();
  
  // Determine interaction type
  let interactionType = 'unknown';
  let commandName = 'unknown';
  
  if (interaction.isCommand()) {
    interactionType = 'command';
    commandName = interaction.commandName;
  } else if (interaction.isButton()) {
    interactionType = 'button';
    const parts = interaction.customId?.split('_');
    commandName = parts?.[0] || 'button';
  } else if (interaction.isModalSubmit()) {
    interactionType = 'modal';
    commandName = interaction.customId || 'modal';
  }
  
  return {
    startTime,
    interactionType,
    commandName,
    guildId: interaction.guildId || 'unknown',
    
    /**
     * End tracking and log results
     */
    end(status: 'success' | 'error' | 'deferred' = 'success'): number {
      const durationMs = Date.now() - startTime;
      const durationS = (durationMs / 1000).toFixed(3);
      
      logger.debug({
        event: `interaction_${interactionType}_${status}`,
        type: interactionType,
        command: commandName,
        guild_id: this.guildId,
        duration_ms: durationMs,
        duration_s: durationS
      }, `${interactionType.toUpperCase()}: ${commandName} → ${status} (${durationS}s)`);
      
      return durationMs;
    },
    
    /**
     * Get elapsed time
     */
    getElapsed(): number {
      return Date.now() - startTime;
    },
    
    /**
     * Get elapsed time in seconds
     */
    getElapsedSeconds(): number {
      return (this.getElapsed() / 1000);
    }
  };
}

/**
 * Batch track multiple operations
 * Useful for operations with multiple sub-steps
 * 
 * @param commandName - Command name
 * @param operations - Array of async operations
 * @returns {Promise<Object>} Results with timing for each step
 * 
 * @example
 * ```typescript
 * const results = await trackBatchOperations('dashboard', [
 *   { name: 'fetch_profile', fn: () => getProfile(steamId) },
 *   { name: 'fetch_matches', fn: () => getMatches(steamId) },
 *   { name: 'generate_image', fn: () => generateCard(data) }
 * ]);
 * ```
 */
export async function trackBatchOperations(
  commandName: string,
  operations: Array<{ name: string; fn: () => Promise<unknown> }>
): Promise<{ [key: string]: { result: unknown; duration_ms: number } }> {
  const results: { [key: string]: { result: unknown; duration_ms: number } } = {};
  
  for (const op of operations) {
    const start = Date.now();
    try {
      const result = await op.fn();
      results[op.name] = {
        result,
        duration_ms: Date.now() - start
      };
      
      const opResult = results[op.name];
      if (opResult) {
        logger.debug({
          event: 'batch_operation',
          command: commandName,
          operation: op.name,
          duration_ms: opResult.duration_ms
        }, `Batch op: ${op.name} (${opResult.duration_ms}ms)`);
      }
      
    } catch (error) {
      results[op.name] = {
        result: null,
        duration_ms: Date.now() - start
      };
      
      logger.error({
        event: 'batch_operation_failed',
        command: commandName,
        operation: op.name,
        error: error instanceof Error ? error.message : String(error)
      }, `Batch op failed: ${op.name}`);
    }
  }
  
  return results;
}

/**
 * Latency middleware for Express routes (if using metrics server)
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next middleware
 */
export function latencyMiddleware(
  req: Record<string, unknown>,
  res: Record<string, unknown> & { on: (event: string, callback: () => void) => void; statusCode: number },
  next: () => void
): void {
  const start = Date.now();
  
  // Track response
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const method = typeof req.method === 'string' ? req.method : 'UNKNOWN';
    const path = typeof req.path === 'string' ? req.path : '/';
    const status = res.statusCode || 500;
    
    logger.debug({
      event: 'http_request',
      method,
      path,
      status,
      duration_s: duration.toFixed(3)
    }, `HTTP ${method} ${path} → ${status} (${duration.toFixed(3)}s)`);
  });
  
  next();
}
