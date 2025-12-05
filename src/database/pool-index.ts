/**
 * PHASE 12: Database Module Update
 * 
 * Uses new optimized PoolManager for:
 * - Automatic retry logic
 * - Failover pool support
 * - Performance monitoring
 * - Health checks
 */

import { QueryResult, PoolClient } from 'pg';
import { poolManager, PoolMetrics } from './pool-manager';

export const query = async (
  text: string,
  values?: unknown[]
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await poolManager.query(text, values);
    const duration = Date.now() - start;

    if (duration > 100) {
      console.warn(`⚠️  Slow query detected (${duration}ms): ${text.substring(0, 50)}`);
    }

    return res;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Database query failed: ${errorMsg}`);
    throw error;
  }
};

/**
 * Get connection for transaction
 * 
 * IMPORTANT: Caller must call release() when done
 * 
 * @returns {Promise<PoolClient>} Database connection
 */
export const getConnection = async (): Promise<PoolClient> => {
  try {
    return await poolManager.getConnection();
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to get database connection: ${errorMsg}`);
    throw error;
  }
};

/**
 * Execute transaction with automatic rollback on error
 * 
 * @template T
 * @param {(client: PoolClient) => Promise<T>} callback - Transaction callback
 * @returns {Promise<T>} Callback result
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Transaction rolled back: ${errorMsg}`);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get pool metrics for monitoring
 * 
 * @returns {PoolMetrics} Current pool metrics
 */
export const getMetrics = (): PoolMetrics => {
  return poolManager.getMetrics();
};

/**
 * Get pool status string
 * 
 * @returns {string} Formatted pool status
 */
export const getStatus = (): string => {
  return poolManager.getStatus();
};

/**
 * Get pool status as JSON
 * 
 * @returns {object} Pool metrics as JSON
 */
export const getStatusJSON = (): object => {
  return poolManager.getStatusJSON();
};

/**
 * Graceful shutdown
 * 
 * @returns {Promise<void>}
 */
export const closePool = async (): Promise<void> => {
  await poolManager.shutdown();
};

export type { PoolMetrics };
