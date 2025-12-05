import pg from 'pg';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
});

// Test connection
pool.on('connect', () => {
  logger.info('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  logger.fatal({ error: err }, '❌ Unexpected database error');
  process.exit(-1);
});

// Query helper
export const query = async (text: string, params?: unknown[]): Promise<pg.QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, 'Executed query');
    return res;
  } catch (error) {
    logger.error({ error, text }, 'Database query error');
    throw error;
  }
};

// Transaction helper
export const transaction = async <T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
