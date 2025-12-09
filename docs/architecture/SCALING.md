# 🚀 Roadmap Escala 1M+ Usuários - APOLO Bot

> **Objetivo:** Transformar bot de 50-100 servidores para arquitetura enterprise pronta para 1 milhão+ usuários

**Documento:** Estratégia técnica, fases, timeline e dependências  
**Data:** December 2025  
**Status:** 🟢 Pronto para implementação

---

## 📊 Visão Geral

### Situação Atual
- ✅ **Usuários:** ~100-500 (múltiplos servidores)
- ✅ **Capacidade:** 50-100 servidores (bot limit)
- ✅ **Arquitetura:** Single shard (Discord.js v14) → Sharding core/IPC implementados e testados (vitest `tests/integration/sharding.test.ts`)
- ✅ **Stack:** TypeScript, PostgreSQL, Redis, Docker
- ❌ **Escalabilidade:** Falta E2E, pooling de DB, otimização de Redis, métricas

### Objetivo Final
- 🎯 **1M+ usuários potenciais**
- 🎯 **5,000-10,000 servidores**
- 🎯 **Zero downtime deployments**
- 🎯 **Sub-segundo responses** (p99 latency < 1s)
- 🎯 **99.9% uptime SLA**

---

## 🏗️ Fases de Implementação

### ⚡ FASE 1: Foundation (2-3 semanas) - **CRÍTICA**
**Objetivo:** Preparar base sólida para crescimento

#### Tarefas Semanais

**Semana 1: Core Infrastructure**

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 1.1 - Input Validation | 4h | Nenhuma | Validar Steam IDs, Discord IDs, modals |
| 1.2 - Structured Logging | 6h | Nenhuma | Winston/Pino setup (arquivo + console) |
| 1.3 - Error Handling | 8h | 1.2 | Try/catch em tudo. Graceful degradation |
| 1.4 - Environment Validation | 2h | Nenhuma | Check .env na startup |

**Semana 2: Reliability**

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 2.1 - Graceful Shutdown | 3h | 1.2 | SIGTERM handler. Fecha conexões |
| 2.2 - Rate Limiting | 4h | Nenhuma | Redis rate limiter (API calls) |
| 2.3 - Database Pooling | 5h | Nenhuma | Otimizar pg pool config |
| 2.4 - Redis Optimization | 4h | Nenhuma | Memory management, key expiry |

**Semana 3: Testing & Monitoring**

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 3.1 - Unit Tests | 12h | Nenhuma | Team Balancer (100% coverage) |
| 3.2 - Prometheus Metrics | 6h | 1.2 | Command latency, error rates |
| 3.3 - Health Checks | 3h | 3.2 | /health endpoint para K8s |
| 3.4 - Docker Optimization | 4h | Nenhuma | Multi-stage build, layer caching |

**Fase 1 Total:** ~60 horas (2-3 semanas, 1 dev)

---

### 🔥 FASE 2: Sharding & Distribution (2-3 semanas) - **CRÍTICA**

**Objetivo:** Escalar de 100 para 5,000+ servidores

#### Arquitetura de Sharding

```typescript
// Estrutura Discord.js v14 ShardingManager
ShardingManager (master process)
├── Shard 0 (bot instance 1)
├── Shard 1 (bot instance 2)
├── Shard 2 (bot instance 3)
└── Shard N (up to 2500 servers per shard)
```

#### Tarefas

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 2.1 - ShardingManager Setup | 8h | 1.4, 1.2 | Converter index.ts para shard spawner |
| 2.2 - Shard Communication | 6h | 2.1 | IPC entre shards (broadcasts, requests) |
| 2.3 - Shard Awareness | 8h | 2.1 | Todos handlers sabem seu shard ID |
| 2.4 - Database Pooling Tuning | 4h | 1.3 | Aumentar max connections (shards × 10) |
| 2.5 - Redis Clustering | 8h | 1.4 | Redis replicação (master/replica) |
| 2.6 - Load Testing | 6h | 2.5 | Simular 5000 servidores. Identificar gargalos |

**Fase 2 Total:** ~40 horas (2-3 semanas, 1 dev)

---

### 📈 FASE 3: Optimization & Advanced Features (3-4 semanas)

**Objetivo:** Otimizar para latência e throughput

#### Tarefas

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 3.1 - BullMQ Job Queues | 12h | 2.6 | Image generation, AI analysis async |
| 3.2 - Database Schema Optimization | 8h | 2.4 | Indexes, partitioning, materialized views |
| 3.3 - API Caching Strategy | 6h | 1.4 | Hero data, meta, builds caching |
| 3.4 - E2E API Tests | 10h | Nenhuma | Testa Stratz, OpenDota, Steam APIs |
| 3.5 - Performance Profiling | 8h | 3.1 | Flame graphs, bottleneck analysis |
| 3.6 - Webhook Integration | 8h | 1.2 | Inbound webhooks para eventos |

**Fase 3 Total:** ~50 horas (3-4 semanas, 1 dev)

---

### 🎯 FASE 4: Deployment & Operations (2 semanas)

**Objetivo:** Deployment em produção com auto-scaling

#### Opções de Deployment

**Opção A: Kubernetes (Recomendado para 1M+ usuários)**
- Auto-scaling por CPU/memory
- Rolling updates (zero downtime)
- Health checks integrados
- Multi-region failover

**Opção B: Docker Swarm (Simples)**
- Menos overhead que K8s
- Bom para 10k-100k usuários
- Setup mais rápido

**Opção C: Railway/Heroku (Fácil, caro)**
- Zero ops (não recomendado em escala)
- Melhor para MVP

#### Tarefas

| Task | Esforço | Dependência | Descrição |
|------|---------|------------|-----------|
| 4.1 - Kubernetes Manifests | 12h | 2.6 | Deployments, services, ingress |
| 4.2 - GitOps Setup | 4h | 4.1 | ArgoCD para deployments automáticos |
| 4.3 - Monitoring Stack | 10h | 3.2 | Prometheus + Grafana + AlertManager |
| 4.4 - Logging Pipeline | 8h | 1.2 | ELK stack (Elasticsearch + Kibana) |
| 4.5 - Backup Strategy | 6h | Nenhuma | PostgreSQL + Redis backups |
| 4.6 - Disaster Recovery | 8h | 4.5 | RTO/RPO targets, runbooks |

**Fase 4 Total:** ~48 horas (2 semanas, 1 dev + ops)

---

## 📋 Timeline Executiva

```
Semana  1-3  │ FASE 1: Foundation         │ ████████ 60h
Semana  4-6  │ FASE 2: Sharding          │ ████████ 40h
Semana  7-10 │ FASE 3: Optimization      │ ████████ 50h
Semana 11-12 │ FASE 4: Deployment        │ ████████ 48h
─────────────┼──────────────────────────┼─────────────
TOTAL        │ 12 semanas (3 meses)     │ 198h (~1 dev)
```

### Marcos Principais

| Semana | Marco | Status |
|--------|-------|--------|
| 3 | ✅ Foundation stable (logging, errors, rate limits) | Ready for 1000 servers |
| 6 | ✅ Sharding implementado (5000+ servers) | Multi-shard operational |
| 10 | ✅ Performance otimizado (< 500ms p95 latency) | BullMQ async processing |
| 12 | ✅ Kubernetes produção (auto-scaling, monitoring) | Ready for 1M+ |

---

## 🎯 Priorização: Qual Começar?

### Comece POR AQUI (HOJE - Próximas 4 horas)

```python
🟢 QUICK WINS (Máximo impacto, mínimo esforço):

1. Input Validation (30 min)
   └─ Validar Steam IDs, Discord IDs
   └─ Evita crashes, API errors

2. Environment Validation (15 min)
   └─ Check .env na startup
   └─ Falha cedo com mensagem clara

3. Graceful Shutdown (30 min)
   └─ SIGTERM handler
   └─ Fecha conexões limpo

4. Structured Logging (2 horas)
   └─ Winston setup
   └─ Essencial para debug depois

TOTAL: ~4 horas
RESULTADO: Bot muito mais robusto
```

### Próximas Prioridades (Semana 1-2)

```
1. Error Handling Comprehensive (8h)
2. Rate Limiting (4h)
3. Database Pooling Tuning (5h)
4. Unit Tests - Team Balancer (12h)
```

---

## 💰 Estimativa de Custo

### Infraestrutura (Mensal)

| Componente | Crescimento | Custo/mês |
|-----------|------------|----------|
| PostgreSQL | 1M queries/dia | $500-2000 |
| Redis | 100M cache hits/dia | $200-800 |
| Bot Hosting (K8s) | 100 shards | $1000-3000 |
| Monitoring (Prometheus/Grafana) | Stack | $100-500 |
| **TOTAL** | **1M usuários** | **$1800-6300** |

### Desenvolvimento

| Fase | Dev Time | Cost (US$180/h) |
|-----|----------|----------------|
| FASE 1 | 60h | ~$10,800 |
| FASE 2 | 40h | ~$7,200 |
| FASE 3 | 50h | ~$9,000 |
| FASE 4 | 48h | ~$8,640 |
| **TOTAL** | **198h** | **~$35,640** |

---

## 🔧 Dependências Entre Fases

```
FASE 1: Foundation ────┐
   ├─ Logging ◄────────┤
   ├─ Error Handling ◄─┤
   └─ Validation ◄────┐│
                      ││
FASE 2: Sharding ◄────┴┘
   ├─ ShardingManager
   ├─ Shard IPC
   └─ Database Tuning ◄─────┐
                             │
FASE 3: Optimization ◄───────┘
   ├─ BullMQ
   ├─ Performance
   └─ E2E Tests
                             
FASE 4: Deployment ◄──────────┐
   ├─ Kubernetes             │
   ├─ GitOps                 │
   └─ Monitoring ◄──────────┐│
                            ││
              All Ready ────┴┘
```

---

## 🚨 Riscos & Mitigação

### Risco 1: Rate Limiting do Discord
**Impacto:** Shard banido se requests > 120/minuto por shard  
**Mitigação:**
- Implementar Discord.js rate limiter automático ✅ (já built-in)
- Monitorar via Prometheus
- Graceful backoff com retry logic

### Risco 2: Database Bottleneck
**Impacto:** Queries lentes com 1M usuários  
**Mitigação:**
- Indexes em tudo (user_id, guild_id, match_id)
- Connection pooling (máx 100 connections)
- Read replicas para SELECT queries
- Materialized views para leaderboards

### Risco 3: API Rate Limits (Stratz, Steam, Gemini)
**Impacto:** 429 errors, degraded service  
**Mitigação:**
- Redis cache agressivo
- Circuit breaker pattern
- Fallback aos dados em cache
- BullMQ para processar async

### Risco 4: Memory Leak em Shards
**Impacto:** Gradual slowdown, OOM kill  
**Mitigação:**
- Heap snapshots regulares
- Memory monitoring via Prometheus
- Auto-restart em K8s se > 80% mem

### Risco 5: Single Point of Failure (Redis/PostgreSQL)
**Impacto:** Outage total  
**Mitigação:**
- Redis replicação (master/replica)
- PostgreSQL replicação standby
- Backup diário para S3
- Disaster recovery runbook

---

## ✅ Checklist de Implementação

### FASE 1: Foundation
- [ ] Input validation em todos os handlers
- [ ] Winston logger com file + console
- [ ] Try/catch em index.ts, all services, handlers
- [ ] .env validation na startup
- [ ] SIGTERM handler (graceful shutdown)
- [ ] Redis rate limiter funcionando
- [ ] pg pool otimizado (maxConnections: 20)
- [ ] Unit tests para Team Balancer (80%+)
- [ ] Prometheus /metrics endpoint
- [ ] Health check endpoint

### FASE 2: Sharding
- [ ] ShardingManager convertido
- [ ] Shard IPC implementado
- [ ] Handlers sabem seu shard
- [ ] Database pooling escalado (maxConnections: 200)
- [ ] Redis clustering configurado
- [ ] Load test com 5000 servidores simulados
- [ ] Monitoramento de shard health

### FASE 3: Optimization
- [ ] BullMQ setup com workers
- [ ] Database schema otimizado (indexes, partitions)
- [ ] API caching strategy implementada
- [ ] E2E tests rodar com sucesso
- [ ] Flame graph analysis completo
- [ ] Webhook endpoints funcionando

### FASE 4: Deployment
- [ ] Kubernetes manifests (replicas: 3)
- [ ] ArgoCD configurado
- [ ] Prometheus + Grafana dashboard
- [ ] ELK stack rodando
- [ ] PostgreSQL + Redis backups automatizados
- [ ] Disaster recovery testado (RTO < 1 hora)

---

## 🎓 Recursos & Documentação

### Discord.js Sharding
- https://discord.js.org/#/docs/discord.js/main/topics/sharding

### Kubernetes para Discord Bots
- https://kubernetes.io/docs/concepts/configuration/overview/
- https://helm.sh/ (Charts para Prometheus, Redis, PostgreSQL)

### Performance Optimization
- Node.js profiling: https://nodejs.org/en/docs/guides/simple-profiling/
- PostgreSQL tuning: https://wiki.postgresql.org/wiki/Performance_Optimization

### Monitoring
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/

### Testing
- Vitest: https://vitest.dev/
- Discord.js testing patterns: https://discord.js.org/#/docs/discord.js/main/topics/welcome

---

## 🤝 Próximos Passos

### HOJE:
1. ✅ Você aprova este roadmap
2. ✅ Definem sprint de 2 semanas
3. ✅ Comece FASE 1 (Foundation)

### SEMANA 1:
- Implementar Quick Wins (4 horas)
- Revisar error handling (8 horas)
- Setup CI/CD para testes

### PRÓXIMAS 12 SEMANAS:
- Seguir fases 1-4 sequencialmente
- Weekly status updates
- Monitoramento de performance
- Preparar para launch em produção

---

## 📞 Decisões Necessárias

**Preciso que você aprove:**

1. ✅ **Confirmação:** Você quer começar HOJE com Quick Wins?
2. ✅ **Deployment:** Kubernetes (recomendado) ou Docker Swarm?
3. ✅ **Orçamento:** $35k dev + $2k-6k infraestrutura/mês - OK?
4. ✅ **Timeline:** 12 semanas para produção - viável?
5. ✅ **Equipe:** Você código ou contrata? Posso ajudar com arquitetura?

---

**Status:** 🟢 Pronto para começar  
**Última atualização:** Dec 4, 2025  
**Próxima revisão:** Weekly (após FASE 1)
