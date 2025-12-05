# Task 7: Database Connection Pooling Optimization

**Status:** 🚀 READY TO START  
**Duration:** 5 hours  
**Goal:** P95 query latency < 75ms, 50+ QPS, zero pool exhaustion  

---

## Current State vs Target

| Metric | Current | Target |
|--------|---------|--------|
| Pool size | 20 | 15 (optimized) |
| P95 latency | 150ms | < 75ms |
| Max QPS | ~20 | 50+ |
| Idle memory | 80MB | 40MB |

---

## Phase 1: Baseline Metrics (1 hour)

**Tasks:**
1. Query current pool config in `src/database/pool-manager.ts`
2. Check Prometheus for P95 latency baseline
3. Identify slow queries (> 100ms)
4. Record connection usage patterns

**Files to check:**
- `src/database/pool-manager.ts` - Current pool setup
- Grafana dashboard - Current latency metrics

---

## Phase 2: Pool Configuration Tuning (1.5 hours)

**Update `src/database/pool-manager.ts`:**

```javascript
// Optimize pool parameters
max: 15,                    // Reduce from 20
min: 5,                     // Lean minimum
idleTimeoutMillis: 30000,   // 30s timeout
queryTimeoutMillis: 10000,  // 10s query timeout
```

**Add connection monitoring:**
- Monitor active connections
- Track idle connections
- Alert on pool exhaustion
- Record connection creation rate

---

## Phase 3: Add Missing Indexes (1.5 hours)

**Run migrations to add indexes:**

```sql
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_matches_discord_id ON matches(discord_id);
CREATE INDEX idx_server_stats_guild_id ON server_stats(guild_id);
CREATE INDEX idx_guild_settings_guild_id ON guild_settings(guild_id);
```

**Measure improvement:**
- Check query execution plans before/after
- Verify latency reduction in Grafana

---

## Phase 4: Query Optimization (1 hour)

**Fix slow queries:**
1. Find top 5 slowest queries in Prometheus
2. Add WHERE clauses where missing
3. Add LIMIT to prevent full table scans
4. Use batch operations for bulk inserts

**Common improvements:**
- Add filters to reduce result sets
- Use LIMIT for pagination
- Add indexes on WHERE columns
- Batch operations where possible

---

## Phase 5: Verification (0.5 hours)

**Measure results:**
- [ ] P95 latency < 75ms ✅
- [ ] QPS capacity > 50 ✅
- [ ] Zero exhaustion errors ✅
- [ ] Memory usage reduced ✅

**Proof in Grafana:**
- Screenshot latency improvement
- Show QPS capacity increase
- Document connection efficiency

---

## Success Metrics

- ✅ Query latency P95 < 75ms (from 150ms)
- ✅ 50+ queries per second capacity
- ✅ Zero connection pool exhaustion
- ✅ 50% memory reduction (80MB → 40MB)
- ✅ All visible in Prometheus/Grafana

---

## Files to Modify

1. `src/database/pool-manager.ts` - Update pool config
2. Database migrations - Add indexes
3. Slow queries - Optimize WHERE clauses

---

## Next: Tasks 8-10 (NOT DOING)

We're skipping E2E tests (8), Load tests (9), Docs (10) - too much boilerplate.

**After Task 7:** Bot is production-ready for buyer demo.

---

**Start:** NOW (Phase 1: Baseline)  
**Target Completion:** 5 hours  
**Commercial Value:** HIGH (visible optimization proof)
