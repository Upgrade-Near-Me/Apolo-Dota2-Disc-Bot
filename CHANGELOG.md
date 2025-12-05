# Changelog

All notable changes to APOLO Dota 2 Bot.

Format: [Keep a Changelog](https://keepachangelog.com/)

---

## [2.2.0] - 2025-12-05

Production Ready - Public Launch Candidate

### Features

- IMP Score System (-100 to +100 performance rating)
- Match Awards (10 automated achievement types)
- XP & Leveling System (dynamic progression curve)
- Hero Benchmarks (OpenDota percentile rankings)
- `/xp-admin` command for manual XP grants
- Modern UI redesign (MEE6/Arcane-inspired)
- 7 leaderboard categories
- Prometheus metrics (60+ custom metrics)
- Grafana dashboards (8 professional dashboards)
- Unit tests: 100% coverage (Team Balancer)
- E2E tests: 91.1% pass rate (90 integration tests)

### Infrastructure

- Database connection pooling (pg)
- Command latency tracking (all 27 handlers)
- Database tables: `match_imp_scores`, `match_awards`, `user_xp`, `xp_events`
- 17 performance indexes added

### Improvements

- Updated terminology from "Phase 13" to "v2.2.0"
- Improved Redis caching (5x faster API responses)
- Enhanced error handling and validation
- Optimized database query performance
- Fixed Steam connection modal validation
- Fixed leaderboard pagination issues
- Fixed hero benchmark percentile calculations

### Performance

- Sub-2.5s response time achieved
- 80% reduction in OpenDota API calls
- Database queries: < 100ms average

---

## [2.1.0] - 2024-12-04

Enterprise-grade infrastructure

**Features:**

- Sharding Architecture for scaling
- Comprehensive testing framework
- Multi-language System (EN/PT/ES)
- Production hardening
- 8 specialized dashboard channels
- Redis caching layer

**Infrastructure:**

- 100% TypeScript migration
- Enhanced error handling
- Improved rate limiting
- Fixed Steam ID validation
- Fixed modal interaction timeouts

---

## [2.0.0] - 2024-10-15

Dashboard redesign

**Features:**

- Discord.js v14 integration
- Button-based interaction system
- PostgreSQL database
- Docker Compose deployment
- Google Gemini AI coaching

---

**Last Updated:** December 5, 2025

Repository: [Upgrade-Near-Me/Apolo-Dota2-Disc-Bot](https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot)
