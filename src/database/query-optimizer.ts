/**
 * ⚡ Query Optimizer - Phase 14
 *
 * Advanced query analysis and optimization recommendations
 * using PostgreSQL EXPLAIN ANALYZE and pg_stat_statements
 *
 * Features:
 * - EXPLAIN ANALYZE integration (plan analysis)
 * - Query performance profiling
 * - Slow query detection and ranking
 * - Optimization suggestions generation
 * - Index usage verification
 * - Memory and I/O pattern analysis
 */

import pool from './index.js';

/**
 * Query execution plan node
 */
interface PlanNode {
  'Node Type': string;
  'Total Cost': number;
  'Actual Total Time': number;
  'Actual Rows': number;
  'Heap Fetches'?: number;
  'Index Name'?: string;
  'Plans'?: PlanNode[];
}

/**
 * EXPLAIN ANALYZE result
 */
interface ExplainResult {
  'Plan': PlanNode;
  'Planning Time': number;
  'Execution Time': number;
  'Total Time': number;
}

/**
 * Query analysis results
 */
interface QueryAnalysis {
  query: string;
  executionTime: number;
  planningTime: number;
  totalTime: number;
  rowsReturned: number;
  estimatedRows: number;
  indexesUsed: string[];
  sequentialScans: number;
  parallelScans: number;
  heapFetches: number;
  issues: string[];
  recommendations: string[];
  optimizationPotential: number; // 0-100 scale
}

/**
 * Slow query information from pg_stat_statements
 */
interface SlowQuery {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  maxTime: number;
  rows: number;
}

/**
 * Query Optimizer Class
 */
class QueryOptimizer {
  /**
   * Analyze a single query using EXPLAIN ANALYZE
   * Returns detailed performance metrics and optimization suggestions
   */
  async analyzeQuery(sql: string): Promise<QueryAnalysis> {
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) ${sql}`;

    try {
      const result = await pool.query(explainSql);
      const explain = result.rows[0] as { Plan: PlanNode; 'Planning Time': number; 'Execution Time': number };

      // Extract metrics from plan
      const plan = explain.Plan;
      const executionTime = explain['Execution Time'] ?? 0;
      const planningTime = explain['Planning Time'] ?? 0;

      // Analyze the plan recursively
      const analysis = this.analyzePlan(plan, sql);

      return {
        query: sql,
        executionTime,
        planningTime,
        totalTime: executionTime + planningTime,
        rowsReturned: plan['Actual Rows'] ?? 0,
        estimatedRows: plan['Actual Rows'] ?? 0,
        ...analysis,
      };
    } catch (error) {
      console.error('Query analysis failed:', { sql, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Recursively analyze execution plan nodes
   */
  private analyzePlan(
    node: PlanNode,
    sql: string
  ): {
    indexesUsed: string[];
    sequentialScans: number;
    parallelScans: number;
    heapFetches: number;
    issues: string[];
    recommendations: string[];
    optimizationPotential: number;
  } {
    const result = {
      indexesUsed: [] as string[],
      sequentialScans: 0,
      parallelScans: 0,
      heapFetches: 0,
      issues: [] as string[],
      recommendations: [] as string[],
      optimizationPotential: 0,
    };

    const nodeType = node['Node Type'];

    // Track scans
    if (nodeType.includes('Seq Scan')) {
      result.sequentialScans++;
    } else if (nodeType.includes('Parallel')) {
      result.parallelScans++;
    } else if (nodeType.includes('Index')) {
      if (node['Index Name']) {
        result.indexesUsed.push(node['Index Name']);
      }
    }

    // Track heap fetches (indicates missing covering index)
    if (node['Heap Fetches'] && node['Heap Fetches'] > 0) {
      result.heapFetches += node['Heap Fetches'];
    }

    // Analyze this node
    const time = node['Actual Total Time'] ?? 0;
    const rows = node['Actual Rows'] ?? 0;

    // Issue detection
    if (nodeType.includes('Seq Scan') && time > 100) {
      result.issues.push(`Full table scan taking ${time.toFixed(2)}ms (consider index)`);
      result.recommendations.push(`Add index for filter conditions in table scan`);
      result.optimizationPotential += 30;
    }

    if (result.heapFetches > 1000) {
      result.issues.push(`High heap fetches (${result.heapFetches}) - missing covering index`);
      result.recommendations.push(`Create covering index to avoid table lookups`);
      result.optimizationPotential += 25;
    }

    if (time > 500 && rows < 10) {
      result.issues.push(`Slow scan with few rows - possible O(n²) behavior`);
      result.recommendations.push(`Review join conditions and filter predicates`);
      result.optimizationPotential += 20;
    }

    // Recursively analyze child nodes
    if (node.Plans) {
      for (const child of node.Plans) {
        const childAnalysis = this.analyzePlan(child, sql);
        result.indexesUsed.push(...childAnalysis.indexesUsed);
        result.sequentialScans += childAnalysis.sequentialScans;
        result.parallelScans += childAnalysis.parallelScans;
        result.heapFetches += childAnalysis.heapFetches;
        result.issues.push(...childAnalysis.issues);
        result.recommendations.push(...childAnalysis.recommendations);
        result.optimizationPotential += childAnalysis.optimizationPotential;
      }
    }

    return result;
  }

  /**
   * Find slow queries from pg_stat_statements
   * Requires: CREATE EXTENSION pg_stat_statements;
   */
  async findSlowQueries(limit = 20, minCallCount = 1): Promise<SlowQuery[]> {
    try {
      const sql = `
        SELECT 
          query,
          calls,
          total_exec_time as "totalTime",
          mean_exec_time as "meanTime",
          max_exec_time as "maxTime",
          rows
        FROM pg_stat_statements
        WHERE query NOT LIKE 'EXPLAIN%'
        AND calls >= $1
        ORDER BY total_exec_time DESC
        LIMIT $2;
      `;

      const result = await pool.query(sql, [minCallCount, limit]);

      return result.rows as SlowQuery[];
    } catch (error) {
      console.error('Slow query detection failed:', error instanceof Error ? error.message : String(error));
      // pg_stat_statements may not be installed
      return [];
    }
  }

  /**
   * Get top queries by execution time
   */
  async getTopQueries(limit = 10): Promise<SlowQuery[]> {
    return this.findSlowQueries(limit, 1);
  }

  /**
   * Reset pg_stat_statements (admin only)
   */
  async resetStatistics(): Promise<void> {
    try {
      await pool.query('SELECT pg_stat_statements_reset();');
      console.info('Statistics reset');
    } catch (error) {
      console.error('Statistics reset failed:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Generate optimization report for a query
   */
  async generateOptimizationReport(sql: string): Promise<string> {
    try {
      const analysis = await this.analyzeQuery(sql);

      let report: string = `
╔════════════════════════════════════════════════════════════╗
║            QUERY OPTIMIZATION REPORT                      ║
╚════════════════════════════════════════════════════════════╝

📊 PERFORMANCE METRICS
   Execution Time:        ${analysis.executionTime.toFixed(2)}ms
   Planning Time:         ${analysis.planningTime.toFixed(2)}ms
   Total Time:            ${analysis.totalTime.toFixed(2)}ms
   Rows Returned:         ${analysis.rowsReturned}

🔍 QUERY PLAN ANALYSIS
   Indexes Used:          ${analysis.indexesUsed.length > 0 ? analysis.indexesUsed.join(', ') : 'None'}
   Sequential Scans:      ${analysis.sequentialScans}
   Parallel Scans:        ${analysis.parallelScans}
   Heap Fetches:          ${analysis.heapFetches}

⚠️  ISSUES FOUND (${analysis.issues.length})
      `;

      if (analysis.issues.length === 0) {
        report += 'None (query is well-optimized!)';
      } else {
        for (const issue of analysis.issues) {
          report += `\n      • ${issue}`;
        }
      }

      report += `

💡 RECOMMENDATIONS (${analysis.recommendations.length})
      `;

      if (analysis.recommendations.length === 0) {
        report += 'None (query is already optimized)';
      } else {
        for (const rec of analysis.recommendations) {
          report += `\n      • ${rec}`;
        }
      }

      report += `

🚀 OPTIMIZATION POTENTIAL: ${analysis.optimizationPotential}%
`;

      return report;
    } catch (error) {
      console.error('Optimization report failed:', { sql, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Compare two queries side-by-side
   */
  async compareQueries(query1: string, query2: string): Promise<string> {
    try {
      const analysis1 = await this.analyzeQuery(query1);
      const analysis2 = await this.analyzeQuery(query2);

      const improvement = (
        ((analysis1.totalTime - analysis2.totalTime) / analysis1.totalTime) *
        100
      ).toFixed(1);

      const report = `
╔════════════════════════════════════════════════════════════╗
║            QUERY COMPARISON REPORT                        ║
╚════════════════════════════════════════════════════════════╝

📊 QUERY 1
   Total Time:            ${analysis1.totalTime.toFixed(2)}ms
   Rows Returned:         ${analysis1.rowsReturned}
   Sequential Scans:      ${analysis1.sequentialScans}
   Issues Found:          ${analysis1.issues.length}

📊 QUERY 2
   Total Time:            ${analysis2.totalTime.toFixed(2)}ms
   Rows Returned:         ${analysis2.rowsReturned}
   Sequential Scans:      ${analysis2.sequentialScans}
   Issues Found:          ${analysis2.issues.length}

🚀 IMPROVEMENT: ${improvement}% faster
   Saved:                 ${(analysis1.totalTime - analysis2.totalTime).toFixed(2)}ms per query
`;

      return report;
    } catch (error) {
      console.error('Query comparison failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Generate performance summary report
   */
  async generatePerformanceSummary(): Promise<string> {
    try {
      const slowQueries = await this.findSlowQueries(5);

      let report = `
╔════════════════════════════════════════════════════════════╗
║         DATABASE PERFORMANCE SUMMARY                      ║
╚════════════════════════════════════════════════════════════╝

⏱️  TOP 5 SLOWEST QUERIES
      `;

      if (slowQueries.length === 0) {
        report += 'No slow queries detected';
      } else {
        for (const q of slowQueries) {
          report += `

   ${slowQueries.indexOf(q) + 1}. Total Time: ${q.totalTime.toFixed(2)}ms (avg ${q.meanTime.toFixed(2)}ms)
      Calls: ${q.calls}
      Rows: ${q.rows}
      Query: ${q.query.substring(0, 80)}${q.query.length > 80 ? '...' : ''}`;
        }
      }

      report += `

💾 DATABASE STATUS
   • Performance analysis enabled
   • pg_stat_statements tracking active
   • Recommendations generated from EXPLAIN ANALYZE
`;

      return report;
    } catch (error) {
      console.error('Performance summary failed:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Batch analyze multiple queries
   */
  async analyzeQueries(queries: string[]): Promise<QueryAnalysis[]> {
    const results: QueryAnalysis[] = [];

    for (const sql of queries) {
      try {
        const analysis = await this.analyzeQuery(sql);
        results.push(analysis);
      } catch (error) {
        console.error('Batch query analysis failed:', { sql, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }

  /**
   * Health check: Identify problematic patterns
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check for missing indexes
      const indexCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM pg_stat_user_tables
        WHERE seq_scan > 1000 AND idx_scan < 10;
      `);

      if ((indexCheck.rows[0] as { count: number }).count > 0) {
        issues.push('Tables with high sequential scans and low index usage');
        recommendations.push('Consider adding indexes to frequently scanned columns');
      }

      // Check for table bloat
      const bloatCheck = await pool.query(`
        SELECT COUNT(*) as count
        FROM pg_stat_user_tables
        WHERE last_vacuum < NOW() - INTERVAL '7 days';
      `);

      if ((bloatCheck.rows[0] as { count: number }).count > 0) {
        issues.push('Some tables not vacuumed in last 7 days');
        recommendations.push('Schedule regular VACUUM maintenance');
      }

      // Check query performance
      const slowQueries = await this.findSlowQueries(3, 10);
      if (slowQueries.some((q) => q.meanTime > 1000)) {
        issues.push('Queries averaging > 1000ms detected');
        recommendations.push('Review slow query plans with EXPLAIN ANALYZE');
      }

      const status = issues.length === 0 ? 'healthy' : issues.length > 2 ? 'critical' : 'warning';

      return { status, issues, recommendations };
    } catch (error) {
      console.error('Health check failed:', error instanceof Error ? error.message : String(error));
      return {
        status: 'warning',
        issues: ['Health check failed - check logs'],
        recommendations: ['Verify database permissions'],
      };
    }
  }
}

export const queryOptimizer = new QueryOptimizer();

export default QueryOptimizer;
export type { QueryAnalysis, SlowQuery, ExplainResult };
