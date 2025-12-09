# 🔒 Deploy Seguro VPS - APOLO Dota 2 Bot

## 🎯 Estratégia: Deploy Isolado com Máximo Isolamento

**Decisão:** Opção A - Deploy isolado em `/root/apolo`

**Motivo:** Máxima segurança, zero interferência com outros projetos, migração futura simplificada.

---

## 🛡️ Garantias de Segurança

### ✅ Isolamento Total

1. **Diretório separado** → `/root/apolo` (independente da VPS principal)
2. **docker-compose próprio** → Mudanças não afetam outros projetos
3. **Database isolado** → `apolo_dota2` (usuário `apolo_user` sem acesso a outros DBs)
4. **Redis namespace** → `apolo:*` (keys isoladas, flush não afeta outros)
5. **Restart independente** → `docker-compose restart` só APOLO
6. **Logs separados** → `docker logs apolo-bot` (não mistura com outros)

### ✅ Proteção Contra Falhas

| Cenário de Falha | Impacto em Outros Projetos |
|------------------|----------------------------|
| APOLO crashar | ✅ **ZERO** - outros continuam |
| Memory leak APOLO | ✅ **ZERO** - Docker kill só apolo-bot |
| CPU 100% (bug) | ✅ **ZERO** - container isolado |
| Erro docker-compose | ✅ **ZERO** - falha só em /root/apolo |
| Rollback versão | ✅ **ZERO** - down/up isolado |

### ✅ Migração Futura Simplificada

**Quando migrar para VPS exclusiva:**
```bash
# Backup completo (5 minutos)
rsync -avz /root/apolo/ root@nova-vps:/root/apolo/

# Deploy nova VPS (1 comando)
cd /root/apolo && docker-compose up -d
```

---

## 📋 Passo a Passo de Deploy Seguro

### **Fase 1: Preparação VPS (Sem Risco)**

#### 1.1. Verificar Network Proxy
```bash
# SSH na VPS
ssh root@31.97.103.184

# Verificar se network 'proxy' existe
docker network ls | grep proxy

# Se não existir, criar
docker network create proxy
```

#### 1.2. Criar Database Isolado
```bash
# Conectar ao PostgreSQL 16 (shared)
docker exec -it postgres psql -U postgres

# Criar database e usuário isolados
CREATE DATABASE apolo_dota2;
CREATE USER apolo_user WITH ENCRYPTED PASSWORD 'SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;

# Verificar isolamento (apolo_user não tem acesso a outros DBs)
\c apolo_dota2
\dt
\q
```

**✅ Validação:**
```bash
# Testar conexão
docker exec -it postgres psql -U apolo_user -d apolo_dota2 -c "SELECT version();"
# Expected: PostgreSQL 16.x
```

#### 1.3. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env em /root/apolo/
mkdir -p /root/apolo
cat > /root/apolo/.env << 'EOF'
# Discord
DISCORD_TOKEN=seu_token_producao_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui

# Database (PostgreSQL 16 compartilhado)
DATABASE_URL=postgresql://apolo_user:SENHA_SEGURA_AQUI@postgres:5432/apolo_dota2

# Redis (Redis 7 compartilhado)
REDIS_URL=redis://:SENHA_REDIS_VPS@redis:6379
REDIS_PREFIX=apolo

# API Keys
STRATZ_API_TOKEN_1=seu_stratz_token
STEAM_API_KEY=seu_steam_key
GEMINI_API_KEY_1=seu_gemini_key

# Monitoring
NODE_ENV=production
LOG_LEVEL=info
METRICS_PORT=9100
EOF

# Proteger .env
chmod 600 /root/apolo/.env
```

---

### **Fase 2: Deploy Inicial (Testado e Seguro)**

#### 2.1. Copiar docker-compose.shared.yml
```bash
# Workflow GitHub fará automaticamente, mas teste manual:
# (no repositório local, push para GitHub)
git add docker-compose.shared.yml
git commit -m "feat: add safe isolated VPS deployment"
git push origin main
```

#### 2.2. Workflow GitHub (Automático)
```yaml
# .github/workflows/deploy-vps.yml já configurado
# Trigger: push to main
# Steps:
#   1. Build Dockerfile.prod
#   2. Push to GHCR (ghcr.io/upgrade-near-me/apolo:latest)
#   3. SSH to VPS
#   4. Create /root/apolo
#   5. Copy docker-compose.shared.yml → /root/apolo/docker-compose.yml
#   6. Copy .env (from secrets)
#   7. docker-compose pull && docker-compose up -d
```

#### 2.3. Deploy Manual (Primeira Vez)
```bash
# SSH na VPS
ssh root@31.97.103.184

# Navegar para diretório isolado
cd /root/apolo

# Pull imagem Docker
docker pull ghcr.io/upgrade-near-me/apolo:latest

# Verificar docker-compose.yml
cat docker-compose.yml
# Expected: serviço apolo-bot com network proxy

# Deploy
docker-compose up -d

# Verificar status
docker ps | grep apolo-bot
# Expected: Up X seconds (healthy)
```

---

### **Fase 3: Validação de Segurança**

#### 3.1. Verificar Isolamento de Container
```bash
# Container rodando?
docker ps | grep apolo-bot
# Expected: Up X minutes (healthy)

# Verificar network
docker inspect apolo-bot | grep -A 10 "Networks"
# Expected: "proxy": { ... }

# Verificar recursos (CPU/RAM)
docker stats apolo-bot --no-stream
# Expected: CPU < 10%, MEM < 300MB
```

#### 3.2. Verificar Isolamento de Database
```bash
# Conectar ao banco APOLO
docker exec -it postgres psql -U apolo_user -d apolo_dota2

# Tentar acessar outro DB (deve falhar)
\c n8n_db
# Expected: FATAL: permission denied for database "n8n_db"

# Verificar tabelas APOLO
\c apolo_dota2
\dt
# Expected: users, guild_settings, matches, etc.
\q
```

#### 3.3. Verificar Isolamento de Redis
```bash
# Conectar ao Redis
docker exec -it redis redis-cli -a ${REDIS_PASSWORD}

# Listar keys APOLO (namespace isolado)
KEYS apolo:*
# Expected: "apolo:stratz:profile:*", "apolo:guild:*", etc.

# Verificar que não tem keys de outros projetos
KEYS n8n:*
# Expected: (lista vazia se apolo não tem acesso)

exit
```

#### 3.4. Verificar Logs Isolados
```bash
# Logs APOLO (não mistura com outros)
docker logs --tail=50 apolo-bot
# Expected:
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🤖 Bot online as APOLO - Dota2

# Logs de outro projeto (para comparar)
docker logs --tail=10 n8n
# Expected: logs n8n (não deve ter logs APOLO)
```

#### 3.5. Executar Migrations
```bash
# Dentro do container APOLO
docker exec -it apolo-bot npx tsx src/database/migrate.ts

# Expected:
# ✅ Running migrations...
# ✅ Migration 002_v2_dashboard_tables.sql completed
# ✅ Migration 007_imp_score.sql completed
# ✅ Migration 008_leveling_xp.sql completed
# ✅ Migration 009_match_awards.sql completed
# ✅ All migrations completed successfully
```

#### 3.6. Deploy Comandos Discord
```bash
docker exec -it apolo-bot npx tsx src/deploy-commands.ts

# Expected:
# ✅ Successfully registered 3 application commands globally
# Commands: dashboard, setup-apolo-structure, remove-apolo-structure, xp-admin
```

---

### **Fase 4: Testes de Isolamento (Garantir Zero Impacto)**

#### 4.1. Teste: Restart APOLO (Outros Continuam)
```bash
# Restart APOLO
cd /root/apolo
docker-compose restart

# Verificar status de outros projetos
docker ps | grep -E "n8n|api-node|discord-bot"
# Expected: Up X hours (não reiniciaram)

# Verificar APOLO
docker ps | grep apolo-bot
# Expected: Up X seconds (reiniciou)
```

#### 4.2. Teste: Stop APOLO (Outros Continuam)
```bash
# Parar APOLO
cd /root/apolo
docker-compose down

# Verificar outros projetos ainda rodando
docker ps
# Expected: n8n, api-node, postgres, redis (todos Up)

# Reativar APOLO
docker-compose up -d
```

#### 4.3. Teste: Load Stress APOLO (Isolamento CPU/RAM)
```bash
# Simular carga no APOLO (teste de stress)
docker exec -it apolo-bot node -e "
  const arr = [];
  setInterval(() => {
    arr.push(new Array(1000000).fill('test'));
    console.log('Memory:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
  }, 100);
"
# (Ctrl+C após 10 segundos)

# Verificar que outros containers não foram afetados
docker stats --no-stream
# Expected: n8n, api-node mantêm CPU/RAM normais
```

#### 4.4. Teste: Erro Proposital no docker-compose (Falha Isolada)
```bash
# Introduzir erro de sintaxe em /root/apolo/docker-compose.yml
cd /root/apolo
sed -i 's/image:/ximage:/' docker-compose.yml

# Tentar subir (deve falhar)
docker-compose up -d
# Expected: ERROR: yaml: line X: found character...

# Verificar que VPS principal não foi afetada
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose ps
# Expected: Todos os serviços Up (não afetados)

# Corrigir erro APOLO
cd /root/apolo
sed -i 's/ximage:/image:/' docker-compose.yml
docker-compose up -d
```

---

### **Fase 5: Configuração de Limites de Recursos (Proteção Extra)**

#### 5.1. Adicionar Resource Limits (Opcional mas Recomendado)
```yaml
# /root/apolo/docker-compose.yml
services:
  apolo-bot:
    image: ghcr.io/upgrade-near-me/apolo:latest
    container_name: apolo-bot
    restart: always
    
    # LIMITES DE RECURSOS (proteção contra memory leaks)
    deploy:
      resources:
        limits:
          cpus: '1.0'      # Max 1 CPU core
          memory: 1G       # Max 1GB RAM
        reservations:
          cpus: '0.5'      # Garantia mínima 0.5 core
          memory: 512M     # Garantia mínima 512MB
    
    # ... resto da configuração ...
```

**Benefícios:**
- ✅ APOLO nunca consome mais de 1 CPU core (outros projetos protegidos)
- ✅ Memory leak limitado a 1GB (não derruba VPS)
- ✅ Docker mata container se ultrapassar limite (restart automático)

#### 5.2. Aplicar Limites
```bash
cd /root/apolo
docker-compose down
docker-compose up -d

# Verificar limites aplicados
docker inspect apolo-bot | grep -A 10 "Memory"
# Expected: "Memory": 1073741824 (1GB)
```

---

## 🔍 Checklist de Validação Final

### ✅ Segurança Confirmada

- [ ] Container `apolo-bot` rodando e healthy
- [ ] Database `apolo_dota2` isolado (apolo_user sem acesso a outros DBs)
- [ ] Redis namespace `apolo:*` isolado
- [ ] Network `proxy` conectando container aos serviços compartilhados
- [ ] Logs APOLO separados (`docker logs apolo-bot`)
- [ ] Restart APOLO não afeta outros projetos (testado)
- [ ] Stop APOLO não para outros containers (testado)
- [ ] Erro no docker-compose APOLO não quebra VPS (testado)
- [ ] Resource limits configurados (CPU 1 core, RAM 1GB)
- [ ] Bot Discord online e respondendo

### ✅ Discord Validation

- [ ] Bot aparece **Online** no servidor Discord
- [ ] Comandos slash aparecem:
  - [ ] `/dashboard`
  - [ ] `/setup-apolo-structure`
  - [ ] `/remove-apolo-structure`
  - [ ] `/xp-admin`
- [ ] `/dashboard` abre painel interativo com botões
- [ ] Buttons funcionam (Connect, Match, Profile, etc.)

---

## 📊 Monitoramento Contínuo

### Health Checks Automáticos
```bash
# Criar script de monitoramento
cat > /root/apolo/health-check.sh << 'EOF'
#!/bin/bash
echo "=== APOLO Health Check ==="
echo ""
echo "1. Container Status:"
docker ps | grep apolo-bot | awk '{print "   Status:", $7, $8, $9}'
echo ""
echo "2. Database Connectivity:"
docker exec apolo-bot curl -f http://localhost:9100/health 2>/dev/null && echo "   ✅ OK" || echo "   ❌ FAIL"
echo ""
echo "3. Resource Usage:"
docker stats apolo-bot --no-stream --format "   CPU: {{.CPUPerc}} | RAM: {{.MemUsage}}"
echo ""
echo "4. Recent Errors (last 10 lines):"
docker logs --tail=10 apolo-bot 2>&1 | grep -i error || echo "   ✅ No errors"
echo ""
EOF

chmod +x /root/apolo/health-check.sh

# Executar
/root/apolo/health-check.sh
```

### Cron Job (Check a cada 5 minutos)
```bash
# Adicionar ao crontab
crontab -e

# Adicionar linha:
*/5 * * * * /root/apolo/health-check.sh >> /root/apolo/health-check.log 2>&1
```

---

## 🚀 Migração Futura para VPS Exclusiva

### Quando Migrar (Futuro)
```bash
# 1. Backup completo do diretório
rsync -avz /root/apolo/ root@nova-vps:/root/apolo/

# 2. Na nova VPS (Ubuntu 22.04 + Docker)
ssh root@nova-vps

# 3. Criar network
docker network create proxy

# 4. Criar serviços compartilhados (se ainda não existirem)
# PostgreSQL
docker run -d --name postgres --network proxy -e POSTGRES_PASSWORD=senha postgres:16

# Redis
docker run -d --name redis --network proxy redis:7

# 5. Deploy APOLO
cd /root/apolo
docker-compose up -d

# ✅ Migração completa em 5 minutos
```

**Vantagens desta Estratégia:**
- ✅ Estrutura de diretório idêntica (`/root/apolo`)
- ✅ docker-compose.yml não precisa mudança
- ✅ Apenas ajustar IPs/senhas no `.env`
- ✅ Zero downtime (deploy novo VPS, depois switch DNS)

---

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker logs --tail=100 apolo-bot

# Problemas comuns:
# 1. Database connection error → Verificar DATABASE_URL
# 2. Redis connection error → Verificar REDIS_URL e senha
# 3. Discord token invalid → Verificar DISCORD_TOKEN no .env
# 4. Port já em uso → Verificar se outro container usa porta 9100
```

### Outros Projetos Afetados (NÃO DEVERIA ACONTECER)
```bash
# Se n8n/api-node pararam após deploy APOLO:
# 1. Verificar logs
docker logs n8n
docker logs api-node

# 2. Verificar network
docker network inspect proxy
# Expected: apolo-bot E outros containers na mesma network

# 3. Restart manual (se necessário)
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose restart n8n api-node

# 4. Reportar issue (não deveria acontecer com isolamento correto)
```

### Rollback de Emergência
```bash
# Parar APOLO completamente
cd /root/apolo
docker-compose down

# Remover container e imagem
docker rm -f apolo-bot
docker rmi ghcr.io/upgrade-near-me/apolo:latest

# Outros projetos continuam funcionando normalmente
```

---

## 📞 Suporte

**Documentação:**
- `docs/deployment/DEPLOYMENT_OPTIONS.md` - Comparação completa
- `docs/deployment/VPS_SHARED_INTEGRATION_GUIDE.md` - Guia VPS compartilhada
- `docs/setup/SETUP.md` - Setup geral

**Logs:**
```bash
# APOLO
docker logs -f apolo-bot

# VPS
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose logs
```

---

**Última Atualização:** 9 de Dezembro de 2025  
**Estratégia:** Deploy Isolado com Máxima Segurança  
**Status:** ✅ Pronto para Produção
