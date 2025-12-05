# 🗺️ APOLO Dota 2 Bot - Roadmap 2025

**Última Atualização:** 5 de Dezembro de 2025  
**Versão Atual:** 2.1 (Production Ready - 70% Enterprise Hardening)

---

## 📊 Status Atual do Projeto

### ✅ FASE 12: Commercial Production Hardening (70% COMPLETA)

**Tarefas Concluídas (7/10):**
1. ✅ Unit Tests (Vitest) - Team Balancer 100% coverage
2. ✅ E2E Tests - 90 tests, 91.1% pass rate
3. ✅ Database Connection Pooling - Optimized
4. ✅ Redis Optimization - 5x faster caching
5. ✅ Prometheus + Grafana - 60+ metrics, 8 dashboards
6. ✅ Command Latency Tracking - All handlers instrumented
7. ✅ Build System - Zero TypeScript errors

**Features Implementadas (Dezembro 2025):**
- ✅ Match Analysis (dashboard_match) - PNG card generation
- ✅ Player Profile (dashboard_profile) - Complete stats
- ✅ Progress Tracking (dashboard_progress) - GPM/XPM charts
- ✅ Server Leaderboard (dashboard_leaderboard) - 4 categories

---

## 🎯 ROADMAP Q1 2025 (Janeiro-Março)

### 🔴 FASE 13: Performance & Gamification (PRIORIDADE MÁXIMA)

**Objetivo:** Transformar bot funcional em experiência competitiva premium

#### Semana 1-2 (Janeiro): Hero Benchmarks + Match Awards
**Inspiração:** OpenDota Benchmarks + Leetify Awards

- [ ] Popular tabela `hero_benchmarks` (OpenDota `/rankings` percentis prontos)
- [ ] Exibir "Top X%" por herói (Embed + Dashboard)
- [ ] Sistema de achievements (10 tipos) com badges
- [ ] Persistir awards por usuário e por partida

**Deliverables:**
- `migrations/008_hero_benchmarks.sql`
- `src/services/benchmarkService.ts`
- `src/utils/matchAwards.ts`
- Embeds: Benchmarks + Awards no dashboard

**ROI:**
- ⏱️ 2-3 dias
- 📈 Engajamento rápido (social proof + viralização)
- 💰 Free tier (atrai usuários)

---

#### Semana 3-4 (Janeiro): IMP Score System
**Inspiração:** Stratz performanceScore (-100 a +100 adaptado)

- [ ] Implementar algoritmo de IMP Score
- [ ] Normalizar por rank tier e role
- [ ] Integrar no Match Analysis (embed + cor)
- [ ] Dashboard histórico de IMP
- [ ] Badge "MVP" para IMP > 75

**Deliverables:**
- `src/utils/impScore.ts` (algoritmo)
- `migrations/007_imp_score.sql` (tabela)
- Embed com IMP Score em match cards

**ROI:**
- ⏱️ 2-3 dias
- 📈 Diferenciador único (nenhum bot BR tem isso)
- 💰 Feature Premium ($5/mês)

---

#### Semana 5-6 (Fevereiro): Leveling & XP System
**Inspiração:** MEE6 + Arcane.bot

- [ ] Sistema de XP (message, voice, match analysis, awards)
- [ ] Level rewards automáticos (roles)
- [ ] Leaderboard semanal/mensal
- [ ] Cooldown anti-spam
- [ ] Voice XP tracking

**XP Sources:**
- ✅ Analisar match → +50 XP
- ✅ Mensagem (1min cooldown) → +15 XP
- ✅ Voz ativa (5min) → +10 XP
- ✅ Achievement → +100 XP
- ✅ Vitória ranqueada → +75 XP

**Deliverables:**
- `migrations/010_leveling_system.sql`
- `src/utils/levelingSystem.ts`
- Level up notifications

**ROI:**
- ⏱️ 2 dias
- 📈 Retenção +50% (sistema viciante)
- 💰 Free tier (XP boosts premium)

---

#### Semana 7-8 (Fevereiro): Ward Heatmap & Vision Score
**Inspiração:** OpenDota `/wardmap` + Tracker.gg lineups

- [ ] Gerar mapa de calor de wards (suas wards vs pro spots)
- [ ] Vision Score calculation (novo metric)
- [ ] Sugestões de spots otimizados

**Deliverables:**
- `src/utils/wardHeatmap.ts`
- PNG heatmap generator
- Vision Score em profile

**ROI:**
- ⏱️ 2 dias
- 📈 Feature premium única
- 💰 Premium ($5/mês)

---

### 🟡 FASE 14: Advanced Analytics (Março)

#### Semana 9-10 (Março): Hero Pool Analysis
**Inspiração:** Stratz heroPerformance + meta heroes**

- [ ] Grid visual de todos os heroes
- [ ] Identificar "Comfort Picks" (>70% WR)
- [ ] "Avoid Picks" (<40% WR)
- [ ] Recommendations engine

**Deliverables:**
- `src/utils/heroPoolAnalyzer.ts`
- Embed com grid de heroes
- Recommendations engine

**ROI:**
- ⏱️ 1 dia
- 📈 Insights acionáveis
- 💰 Free tier

---

## 🟢 FASE 15: Social & Community (Q2 2025)

### Abril-Junho: Engagement Features

#### Abril
- [ ] **Reaction Roles** (self-assign position roles)
- [ ] **Social Alerts** (Twitch/YouTube notifications)
- [ ] **Server Counters** (voice channels com stats)

#### Maio
- [ ] **Giveaway System** (sorteios automáticos)
- [ ] **Polls & Voting** (community decisions)
- [ ] **Auto-Moderation V2** (advanced filters)

#### Junho
- [ ] **Ticket System** (suporte automatizado)
- [ ] **Auto-Moderation** (anti-spam, bad words)
- [ ] **Welcome Messages** (personalizadas)

---

## 🚀 FASE 16: Premium Launch (Q3 2025)

### Julho-Agosto: Monetization

#### Tier Structure

**Free Tier** ($0/mês)
- ✅ 3 match analyses/dia
- ✅ Hero benchmarks
- ✅ Match awards
- ✅ Basic leveling
- ✅ Hero pool analysis

**Premium** ($5/mês)
- ✅ Todo Free +
- ✅ IMP Score System
- ✅ Ward Heatmap
- ✅ Unlimited analyses
- ✅ Priority support
- ✅ XP boost (2x)

**Ultimate** ($10/mês)
- ✅ Todo Premium +
- ✅ Card Collection Game
- ✅ Teamfight Replay GIFs
- ✅ Advanced AI coaching
- ✅ Private sessions

#### Payment Integration
- [ ] Stripe integration
- [ ] Subscription management dashboard
- [ ] Role auto-assignment
- [ ] Billing portal

**Revenue Target:** $500 MRR (100 assinantes @ $5/mês)

---

## 🎲 FASE 17: Gamification 2.0 (Q4 2025)

### Setembro-Dezembro: Card Collection & Economy

#### Card Collection System
**Inspiração:** Mudae, Karuta, Gachapon

- [ ] Hero card pulling (gacha)
- [ ] Rarity system (Common to Legendary)
- [ ] Trading marketplace
- [ ] Card leveling (duplicates)
- [ ] Collection showcase

#### Server Economy
**Inspiração:** OwO Bot

- [ ] Virtual currency (APOLO Coins)
- [ ] Daily rewards
- [ ] Betting mini-games
- [ ] Shop com cosmetics
- [ ] Coin transfers

---

## 📊 Competitive Analysis Summary

### Plataformas Estudadas (Dezembro 2025)

1. **Stratz** - IMP Score, Hero Guides, Playback Tool
2. **OpenDota** - Benchmarks, Hero Rankings, Peer Analysis
3. **Tracker.gg** (Valorant/CS2) - Lineups, Agent Insights, Real-time overlays
4. **Leetify** (CS2) - Personal Bests, Achievements, Leetify Rating
5. **U.gg/Blitz** (LoL) - Build recommendations, Live game overlays
6. **MEE6** - Leveling, XP, Custom bot, Reaction roles
7. **Arcane.bot** - Voice leveling, Counters, Moderation
8. **Top.gg Marketplace** - 50+ bots analisados

**Total de Features Catalogadas:** 35+  
**Documentação Completa:** `docs/COMPETITIVE_ANALYSIS_COMPLETE.md`

---

## 🎯 KPIs & Success Metrics

### Engagement Targets (2025)

| Métrica | Atual | Q1 | Q2 | Q3 | Q4 |
|---------|-------|----|----|----|----|
| DAU (Daily Active Users) | 200 | 500 | 1,000 | 2,000 | 5,000 |
| Match Analyses/Day | 50 | 300 | 800 | 1,500 | 3,000 |
| Retention (30-day) | 40% | 50% | 60% | 70% | 75% |
| Premium Subs | 0 | 20 | 50 | 100 | 200 |
| MRR (Monthly Revenue) | $0 | $100 | $250 | $500 | $1,000 |

### Technical Targets

| Métrica | Atual | Target Q4 2025 |
|---------|-------|----------------|
| Response Time | <2.5s | <1s |
| Uptime | 99.5% | 99.9% |
| API Latency | 300ms | 150ms |
| Database Queries | 50ms | 20ms |
| Redis Hit Rate | 85% | 95% |

---

## 🚧 Known Issues & Technical Debt

### Infrastructure
- [ ] Database pool tuning (Task 7 Phase 2-5) - 5 horas
- [ ] Sharding preparation (100k+ users) - Fase 17
- [ ] Rate limiting per user - Quick win (4h)
- [ ] Graceful shutdown handler - Quick win (2h)

### Features
- [ ] Voice XP tracking not implemented
- [ ] Reaction role system pending
- [ ] Social alerts (Twitch/YouTube) pending
- [ ] Custom bot personalizer pending

### Testing
- [ ] E2E API tests for Gemini AI
- [ ] Load testing (>10k concurrent users)
- [ ] Integration tests for payment system

---

## 📚 Documentation References

### Development Guides
- [Competitive Analysis](./COMPETITIVE_ANALYSIS_COMPLETE.md) - 35+ features catalogadas
- [Scale Roadmap](./SCALE_1M_ROADMAP.md) - Plan to 1M+ users
- [I18n Guide](./I18N_GUIDE.md) - Multi-language implementation
- [Redis Optimization](./REDIS_QUICK_REFERENCE.md) - Caching best practices
- [Prometheus Metrics](./PROMETHEUS_METRICS_GUIDE.md) - Monitoring setup
- [Command Latency](./COMMAND_LATENCY_TRACKING_GUIDE.md) - Performance tracking

### Architecture Docs
- [Project Summary](../PROJECT_SUMMARY.md) - Complete technical overview
- [Features Guide](../FEATURES.md) - All implemented features
- [Setup Guide](../SETUP.md) - Installation instructions
- [Docker Guide](../DOCKER.md) - Container deployment

---

## 🤝 Contributing

### Development Workflow

1. **Pick a feature** from this roadmap
2. **Create GitHub issue** with label (enhancement/bug/premium)
3. **Branch naming:** `feature/imp-score` or `fix/redis-connection`
4. **Develop & test** locally with Docker
5. **Open PR** with description + screenshots
6. **Code review** by maintainers
7. **Merge & deploy** to production

### Priority Labels

- 🔴 **P0 - Critical** - Blocking production issues
- 🟠 **P1 - High** - Tier 1 features (IMP Score, Benchmarks)
- 🟡 **P2 - Medium** - Tier 2 features (Ward Heatmap, Hero Pool)
- 🟢 **P3 - Low** - Tier 3 features (Card Collection, Economy)

---

## 📞 Support & Community

- **Discord Server:** [Join here](https://discord.gg/apolo-dota2)
- **GitHub Issues:** [Report bugs](https://github.com/your-repo/issues)
- **Email:** support@apolo-bot.com
- **Twitter:** [@ApoloDota2Bot](https://twitter.com/ApoloDota2Bot)

---

## 📝 Changelog

### Version 2.1 (December 2025)
- ✅ Added 4 core features (Match, Profile, Progress, Leaderboard)
- ✅ Fixed 41 TypeScript compilation errors
- ✅ Docker production deployment successful
- ✅ Competitive analysis complete (35+ features)
- ✅ Roadmap 2025 created

### Version 2.0 (November 2025)
- ✅ Phase 12 commercial hardening (70% complete)
- ✅ Unit tests with 100% coverage (Team Balancer)
- ✅ E2E tests (90 tests, 91.1% pass rate)
- ✅ Prometheus + Grafana monitoring
- ✅ Redis optimization (5x faster)

### Version 1.0 (October 2025)
- ✅ Initial release
- ✅ Basic dashboard with 12 buttons
- ✅ Multi-language support (EN/PT/ES)
- ✅ PostgreSQL + Redis setup
- ✅ Docker deployment ready

---

**Roadmap criado por:** APOLO Development Team  
**Próxima revisão:** Janeiro 2026  
**Status:** Em desenvolvimento ativo 🚀
