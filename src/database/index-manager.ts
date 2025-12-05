/**
 * PHASE 14: Index Manager Implementation
 * 
 * Enterprise index management with creation, monitoring, and optimization
 * - Create/drop indexes with CONCURRENT support
 * - Monitor index usage patterns
 * - Detect unused and bloated indexes
 * - Auto-vacuum and reindex management
 * - Health monitoring and alerts
 * 
 * Duration: ~1 hour
 * Status: Phase 14.1-14.2 (Index Creation & Monitoring)
 */

import pool from './index.js';
import type { IndexDefinition } from './indexes.js';

export interface IndexStats {
  schemaname: string;
  tablename: string;
  indexname: string;
  idx_scan: number;
  idx_tup_read: number;
  idx_tup_fetch: number;
  pg_size_pretty: string;
}

export interface UnusedIndex {
  schemaname: string;
  tablename: string;
  indexname: string;
  size_mb: number;
}

export interface IndexBloat {
  schemaname: string;
  tablename: string;
  indexname: string;
  bloat_ratio: number;
  size_mb: number;
}

export class IndexManager {
  /**
   * Create all indexes from definitions
   */
  async createIndexes(indexes: IndexDefinition[]): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ index: string; error: string }>;
  }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ index: string; error: string }>,
    };

    console.log(`📊 Creating ${indexes.length} indexes...`);

    for (const idx of indexes) {
      try {
        await this.createIndex(idx);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: idx.name,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`❌ Failed to create index ${idx.name}:`, error);
      }
    }

    console.log(
      `✅ Created: ${results.successful}, ❌ Failed: ${results.failed}, Total: ${indexes.length}`
    );

    return results;
  }

  /**
   * Create single index
   */
  async createIndex(index: IndexDefinition): Promise<void> {
    const concurrent = index.concurrent ? 'CONCURRENTLY' : '';
    const unique = index.unique ? 'UNIQUE' : '';
    const type = index.type === 'BTREE' ? '' : `USING ${index.type}`;
    const columns = index.columns.join(', ');
    const where = index.partial ? ` WHERE ${index.partial}` : '';

    const sql = `
      CREATE ${unique} INDEX ${concurrent} IF NOT EXISTS ${index.name}
      ON ${index.table} ${type}(${columns})${where};
    `;

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(
        `✅ Index created: ${index.name} (${index.description})`
      );
    } finally {
      client.release();
    }
  }

  /**
   * Drop index safely
   */
  async dropIndex(indexName: string, concurrent = true): Promise<void> {
    const concurrentStr = concurrent ? 'CONCURRENTLY' : '';
    const sql = `DROP INDEX ${concurrentStr} IF EXISTS ${indexName};`;

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`✅ Index dropped: ${indexName}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get detailed index statistics
   */
  async getIndexStats(): Promise<IndexStats[]> {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as pg_size_pretty
      FROM pg_stat_user_indexes
      WHERE schemaname NOT LIKE 'pg_%'
      ORDER BY idx_scan DESC;
    `;

    const result = await pool.query(sql);
    return result.rows as IndexStats[];
  }

  /**
   * Find unused indexes (candidates for removal)
   */
  async findUnusedIndexes(): Promise<UnusedIndex[]> {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        ROUND(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2) as size_mb
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      AND indexname NOT LIKE 'pg_toast%'
      AND schemaname NOT LIKE 'pg_%'
      ORDER BY pg_relation_size(indexrelid) DESC;
    `;

    const result = await pool.query(sql);
    return result.rows as UnusedIndex[];
  }

  /**
   * Analyze index bloat (fragmentation)
   */
  async analyzeIndexBloat(): Promise<IndexBloat[]> {
    const sql = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        ROUND(100.0 * (pg_relation_size(indexrelid) - pg_relation_size(relfilenode)) / 
              pg_relation_size(indexrelid), 2) as bloat_ratio,
        ROUND(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2) as size_mb
      FROM pg_stat_user_indexes
      WHERE pg_relation_size(indexrelid) > 1000000
      AND schemaname NOT LIKE 'pg_%'
      ORDER BY bloat_ratio DESC;
    `;

    const result = await pool.query(sql);
    return result.rows as IndexBloat[];
  }

  /**
   * Reindex table
   */
  async reindexTable(tableName: string): Promise<void> {
    const sql = `REINDEX TABLE CONCURRENTLY ${tableName};`;

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`✅ Table reindexed: ${tableName}`);
    } finally {
      client.release();
    }
  }

  /**
   * Reindex all indexes
   */
  async reindexAll(): Promise<void> {
    const dbName = process.env.DB_NAME || 'apolo_dota2';
    const sql = `REINDEX DATABASE CONCURRENTLY ${dbName};`;

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ All indexes reindexed');
    } finally {
      client.release();
    }
  }

  /**
   * Vacuum table (removes dead rows)
   */
  async vacuumTable(tableName: string, analyze = true): Promise<void> {
    const analyzeStr = analyze ? 'ANALYZE' : '';
    const sql = `VACUUM ${analyzeStr} ${tableName};`;

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log(`✅ Table vacuumed: ${tableName}`);
    } finally {
      client.release();
    }
  }

  /**
   * Vacuum and analyze all tables
   */
  async vacuumAnalyzeAll(): Promise<void> {
    const sql = 'VACUUM ANALYZE;';

    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ VACUUM ANALYZE completed for all tables');
    } finally {
      client.release();
    }
  }

  /**
   * Get index recommendations based on missing indexes
   */
  async getIndexRecommendations(): Promise<string[]> {
    const sql = `
      SELECT schemaname, tablename, attname, n_distinct, correlation
      FROM pg_stats
      WHERE schemaname NOT LIKE 'pg_%'
      AND n_distinct > 100
      ORDER BY n_distinct DESC
      LIMIT 20;
    `;

    const result = await pool.query(sql);
    const recommendations: string[] = [];

    for (const row of result.rows as unknown[]) {
      const typedRow = row as { n_distinct?: number; correlation?: number; tablename?: string; attname?: string };
      const nDistinct = typedRow.n_distinct ?? 0;
      const correlation = typedRow.correlation ?? 0;
      
      if (nDistinct > 1000 && Math.abs(correlation) < 0.1) {
        recommendations.push(
          `CREATE INDEX idx_${typedRow.tablename}_${typedRow.attname} ON ${typedRow.tablename}(${typedRow.attname});`
        );
      }
    }

    return recommendations;
  }

  /**
   * Get index health report
   */
  async getHealthReport(): Promise<string> {
    const stats = await this.getIndexStats();
    const unused = await this.findUnusedIndexes();
    const bloat = await this.analyzeIndexBloat();

    let report = `
╔════════════════════════════════════════════╗
║       DATABASE INDEX HEALTH REPORT         ║
╚════════════════════════════════════════════╝

📊 INDEX STATISTICS
   Total Indexes:       ${stats.length}
   Active (scanned):    ${stats.filter((s) => s.idx_scan > 0).length}
   Unused:              ${unused.length}

🔥 TOP INDEXES BY USAGE
    `;

    const top5 = stats.slice(0, 5);
    for (const idx of top5) {
      report += `\n    ${idx.indexname}: ${idx.idx_scan} scans (${idx.pg_size_pretty})`;
    }

    report += `

⚠️  UNUSED INDEXES (${unused.length})
    `;

    if (unused.length === 0) {
      report += 'None (all indexes are being used!)';
    } else {
      for (const idx of unused.slice(0, 5)) {
        report += `\n    ${idx.indexname} (${idx.size_mb}MB)`;
      }
      if (unused.length > 5) {
        report += `\n    ... and ${unused.length - 5} more`;
      }
    }

    report += `

🔴 BLOATED INDEXES (${bloat.length})
    `;

    if (bloat.length === 0) {
      report += 'None (all indexes are healthy!)';
    } else {
      for (const idx of bloat.slice(0, 5)) {
        report += `\n    ${idx.indexname}: ${idx.bloat_ratio}% bloat (${idx.size_mb}MB)`;
      }
      if (bloat.length > 5) {
        report += `\n    ... and ${bloat.length - 5} more`;
      }
    }

    report += `

═══════════════════════════════════════════
    `;

    return report.trim();
  }

  /**
   * Full maintenance routine
   */
  async performMaintenance(): Promise<{
    vacuumTime: number;
    reindexTime: number;
    analyzeTime: number;
    totalTime: number;
  }> {
    console.log('🔧 Starting database maintenance routine...');

    const startTime = Date.now();

    // Step 1: Vacuum (remove dead rows)
    console.log('1️⃣  Running VACUUM...');
    const vacuumStart = Date.now();
    await this.vacuumAnalyzeAll();
    const vacuumTime = Date.now() - vacuumStart;

    // Step 2: Reindex (rebuild fragmented indexes)
    console.log('2️⃣  Running REINDEX...');
    const reindexStart = Date.now();
    try {
      await this.reindexAll();
    } catch {
      console.warn('⚠️  REINDEX skipped (may not be available in your PostgreSQL version)');
    }
    const reindexTime = Date.now() - reindexStart;

    // Step 3: Analyze (update statistics)
    console.log('3️⃣  Running ANALYZE...');
    const analyzeStart = Date.now();
    await this.vacuumAnalyzeAll();
    const analyzeTime = Date.now() - analyzeStart;

    const totalTime = Date.now() - startTime;

    console.log(`
✅ Maintenance completed in ${(totalTime / 1000).toFixed(2)}s
   - VACUUM: ${(vacuumTime / 1000).toFixed(2)}s
   - REINDEX: ${(reindexTime / 1000).toFixed(2)}s
   - ANALYZE: ${(analyzeTime / 1000).toFixed(2)}s
    `);

    return {
      vacuumTime,
      reindexTime,
      analyzeTime,
      totalTime,
    };
  }

  /**
   * Get index size summary
   */
  async getIndexSizes(): Promise<{
    totalIndexSize: number;
    largestIndexes: Array<{ name: string; size_mb: number }>;
  }> {
    const sql = `
      SELECT 
        indexname,
        ROUND(pg_relation_size(indexrelid) / 1024.0 / 1024.0, 2) as size_mb
      FROM pg_stat_user_indexes
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20;
    `;

    const result = await pool.query(sql);

    const typedRows = result.rows as unknown[];
    const totalSize = typedRows.reduce((sum: number, row) => {
      const typedRow = row as { size_mb?: number };
      return sum + (typedRow.size_mb || 0);
    }, 0);

    return {
      totalIndexSize: totalSize,
      largestIndexes: typedRows.map((row) => {
        const typedRow = row as { indexname?: string; size_mb?: number };
        return {
          name: typedRow.indexname || '',
          size_mb: typedRow.size_mb || 0,
        };
      }),
    };
  }
}

export const indexManager = new IndexManager();

export default IndexManager;
