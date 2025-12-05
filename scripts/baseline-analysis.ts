#!/usr/bin/env node

/**
 * TASK 7 Phase 1: Database Baseline Analysis
 * 
 * Measures current pool performance to establish optimization baseline
 */

import { Pool } from 'pg';

async function getBaseline() {
  // Connect to localhost since script runs outside Docker
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'apolo_dota2',
    max: 20,  // Current setting
    min: 5,
  });

  console.log('\n📊 DATABASE BASELINE ANALYSIS');
  console.log('=' .repeat(60));

  try {
    // 1. Get pool info
    const poolStatus = pool.totalCount;
    const idleCount = pool.idleCount;
    const activeConnections = poolStatus - idleCount;

    console.log('\n🔌 CURRENT POOL STATE:');
    console.log(`   Total connections: ${poolStatus}`);
    console.log(`   Active connections: ${activeConnections}`);
    console.log(`   Idle connections: ${idleCount}`);
    console.log(`   Utilization: ${(activeConnections / poolStatus * 100).toFixed(1)}%`);

    // 2. Query current pool config
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          setting,
          CASE WHEN name = 'max_connections' THEN current_setting('max_connections')
               WHEN name = 'shared_buffers' THEN current_setting('shared_buffers')
               ELSE current_setting(name) END as value
        FROM pg_settings
        WHERE name IN ('max_connections', 'shared_buffers', 'work_mem', 'maintenance_work_mem')
      `);

      console.log('\n⚙️ POSTGRESQL CONFIG:');
      result.rows.forEach((row: any) => {
        console.log(`   ${row.name || 'setting'}: ${row.value}`);
      });

      // 3. Measure query latency
      console.log('\n⏱️ QUERY LATENCY SAMPLING (10 queries):');
      const latencies: number[] = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await client.query('SELECT 1');
        const duration = Date.now() - start;
        latencies.push(duration);
        console.log(`   Query ${i + 1}: ${duration}ms`);
      }

      const avg = latencies.reduce((a, b) => a + b) / latencies.length;
      const sorted = latencies.sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];

      console.log(`\n   Average: ${avg.toFixed(1)}ms`);
      console.log(`   P95: ${p95}ms`);
      console.log(`   P99: ${p99}ms`);

      // 4. Check for slow queries log
      console.log('\n📋 SLOW QUERIES (log_min_duration_statement = 100ms):');
      const slowQueries = await client.query(`
        SELECT query, calls, mean_exec_time, max_exec_time 
        FROM pg_stat_statements 
        WHERE mean_exec_time > 100 
        ORDER BY mean_exec_time DESC 
        LIMIT 5
      `);

      if (slowQueries.rows.length === 0) {
        console.log('   No slow queries tracked (extension may not be installed)');
        console.log('   Tip: Install pg_stat_statements for query profiling');
      } else {
        slowQueries.rows.forEach((row: any, idx: number) => {
          console.log(`   ${idx + 1}. ${row.query.substring(0, 50)}...`);
          console.log(`      Mean time: ${row.mean_exec_time.toFixed(2)}ms, Max: ${row.max_exec_time.toFixed(2)}ms`);
        });
      }

      // 5. Database size
      console.log('\n📦 DATABASE STATS:');
      const dbStats = await client.query(`
        SELECT 
          datname,
          pg_size_pretty(pg_database_size(datname)) as size,
          numbackends as active_connections
        FROM pg_stat_database
        WHERE datname = current_database()
      `);

      if (dbStats.rows.length > 0) {
        const row = dbStats.rows[0];
        console.log(`   Database size: ${row.size}`);
        console.log(`   Active backends: ${row.active_connections}`);
      }

      // 6. Table sizes
      console.log('\n📊 TABLE SIZES:');
      const tables = await client.query(`
        SELECT 
          schemaname, 
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_live_tup as row_count
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 5
      `);

      tables.rows.forEach((row: any) => {
        console.log(`   ${row.tablename}: ${row.size} (${row.row_count} rows)`);
      });

    } finally {
      client.release();
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BASELINE COMPLETE');
    console.log('\n📝 NEXT STEPS (Phase 2):');
    console.log('   1. Update pool config: max 20 → 15, add timeouts');
    console.log('   2. Add missing indexes (Phase 3)');
    console.log('   3. Optimize slow queries (Phase 4)');
    console.log('   4. Verify improvements in Grafana (Phase 5)');

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  } finally {
    await pool.end();
  }
}

getBaseline();
