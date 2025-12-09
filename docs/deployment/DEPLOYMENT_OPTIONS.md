# 🚀 Opções de Deployment - APOLO na VPS

## ✅ Confirmado: SEM Problema "Docker dentro de Docker"

APOLO é um container Node.js padrão que conecta a serviços compartilhados via Docker network. Não há conflito.

---

## 🎯 Duas Estratégias de Deployment

### **Opção A: Deploy Isolado** (`/root/apolo`)

#### Como Funciona
```bash
VPS (Ubuntu 22.04)
├── /root/apolo/ ← NOVO diretório
│   ├── docker-compose.yml (copiado de docker-compose.shared.yml)
│   └── .env (variáveis de ambiente)
└── /root/VPS-UPGRADE-VKM4-01-HTG-ZCB/ (estrutura existente)
```

#### Processo
1. Workflow cria `/root/apolo`
2. Copia `docker-compose.shared.yml` → `/root/apolo/docker-compose.yml`
3. Executa `docker-compose up -d` em `/root/apolo`
4. Container `apolo-bot` conecta via network `proxy` aos serviços compartilhados

#### Comandos
```bash
# Deploy
cd /root/apolo
docker-compose up -d

# Logs
docker logs -f apolo-bot

# Stop
docker-compose down

# Update
docker-compose pull && docker-compose up -d
```

#### Pré-requisitos
- ✅ Network `proxy` deve existir: `docker network create proxy`
- ✅ Postgres 16 rodando: container `postgres` acessível via network
- ✅ Redis 7 rodando: container `redis` acessível via network
- ✅ Variáveis de ambiente configuradas em `.env`

#### Prós
- ✅ APOLO gerenciado separadamente (independente)
- ✅ Fácil rollback (apenas restart do container)
- ✅ Não mexe na estrutura VPS existente
- ✅ **IMPLEMENTAÇÃO ATUAL** (workflow já configurado)

#### Contras
- ⚠️ Não segue padrão VPS (outros projetos estão centralizados)
- ⚠️ Requer criação manual de network `proxy` (se não existir)
- ⚠️ Dois locais de docker-compose (apolo + VPS)

---

### **Opção B: Deploy Integrado** (Estrutura VPS Centralizada)

#### Como Funciona
```bash
VPS (Ubuntu 22.04)
└── /root/VPS-UPGRADE-VKM4-01-HTG-ZCB/
    ├── docker-compose.yml ← ADICIONAR serviço apolo-bot
    └── projects/
        └── apolo/ ← NOVO diretório
            ├── Dockerfile.prod
            └── .env (variáveis específicas)
```

#### Processo
1. Adicionar serviço `apolo-bot` ao `docker-compose.yml` central
2. Colocar Dockerfile.prod em `/root/VPS-UPGRADE-VKM4-01-HTG-ZCB/projects/apolo/`
3. Executar `docker-compose up -d` na raiz VPS
4. APOLO gerenciado junto com todos os outros serviços

#### Configuração VPS docker-compose.yml
```yaml
# /root/VPS-UPGRADE-VKM4-01-HTG-ZCB/docker-compose.yml
services:
  # ... serviços existentes (postgres, redis, traefik, etc) ...

  apolo-bot:
    image: ghcr.io/upgrade-near-me/apolo:latest
    container_name: apolo-bot
    restart: always
    networks:
      - proxy
    environment:
      DISCORD_TOKEN: ${APOLO_DISCORD_TOKEN}
      DISCORD_CLIENT_ID: ${APOLO_DISCORD_CLIENT_ID}
      DATABASE_URL: postgresql://${APOLO_DB_USER}:${APOLO_DB_PASSWORD}@postgres:5432/${APOLO_DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      REDIS_PREFIX: apolo
      STRATZ_API_TOKEN_1: ${APOLO_STRATZ_API_TOKEN_1}
      STEAM_API_KEY: ${APOLO_STEAM_API_KEY}
      GEMINI_API_KEY_1: ${APOLO_GEMINI_API_KEY_1}
      NODE_ENV: production
      LOG_LEVEL: info
      METRICS_PORT: 9100
    expose:
      - "9100"
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9100/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### Comandos
```bash
# Deploy (na raiz VPS)
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose up -d apolo-bot

# Logs
docker logs -f apolo-bot

# Stop
docker-compose stop apolo-bot

# Update
docker-compose pull apolo-bot && docker-compose up -d apolo-bot
```

#### Prós
- ✅ Segue padrão VPS (consistente com outros projetos)
- ✅ Gerenciamento centralizado (um único docker-compose.yml)
- ✅ Backups automáticos (scripts VPS já existentes)
- ✅ Monitoramento unificado (via Portainer/Traefik)

#### Contras
- ⚠️ Requer modificação do docker-compose.yml VPS (risco de erro)
- ⚠️ Workflow GitHub precisa ser alterado
- ⚠️ Deploy manual na primeira vez

---

## 📋 Pré-requisitos Comuns (Ambas Opções)

### 1. Database Setup (PostgreSQL 16)
```bash
# SSH na VPS
ssh root@31.97.103.184

# Conectar ao postgres
docker exec -it postgres psql -U postgres

# Criar database e usuário
CREATE DATABASE apolo_dota2;
CREATE USER apolo_user WITH PASSWORD 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;
\q
```

### 2. Network Setup (apenas Opção A)
```bash
# Verificar se network 'proxy' existe
docker network ls | grep proxy

# Se não existir, criar
docker network create proxy
```

### 3. Variáveis de Ambiente
```bash
# Adicionar ao .env da VPS
APOLO_DISCORD_TOKEN=token_producao
APOLO_DISCORD_CLIENT_ID=client_id
APOLO_DB_USER=apolo_user
APOLO_DB_PASSWORD=senha_segura_aqui
APOLO_DB_NAME=apolo_dota2
APOLO_STRATZ_API_TOKEN_1=stratz_token
APOLO_STEAM_API_KEY=steam_key
APOLO_GEMINI_API_KEY_1=gemini_key
REDIS_PASSWORD=redis_password_vps
```

---

## 🔍 Validação de Deploy

### Checklist Pós-Deploy
```bash
# 1. Verificar container rodando
docker ps | grep apolo-bot
# Expected: Up X minutes (healthy)

# 2. Verificar logs (sem erros)
docker logs --tail=50 apolo-bot
# Expected:
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🤖 Bot online as APOLO - Dota2

# 3. Testar health endpoint
docker exec apolo-bot curl http://localhost:9100/health
# Expected: {"status":"ok","uptime":123}

# 4. Executar migrations
docker exec -it apolo-bot npx tsx src/database/migrate.ts
# Expected: ✅ All migrations completed successfully

# 5. Deploy comandos Discord
docker exec -it apolo-bot npx tsx src/deploy-commands.ts
# Expected: ✅ Successfully registered 3 application commands
```

### Discord Validation
1. Bot deve aparecer **Online** no servidor Discord
2. Comandos slash devem aparecer ao digitar `/`:
   - `/dashboard`
   - `/setup-apolo-structure`
   - `/remove-apolo-structure`
   - `/xp-admin`
3. Testar `/dashboard` - deve abrir painel interativo

---

## 🎯 Recomendação

### Para Deploy RÁPIDO (Produção Imediata):
**Escolher Opção A** - Deploy Isolado em `/root/apolo`

**Motivo:**
- ✅ Workflow GitHub já configurado (apenas ajustes finais)
- ✅ Não requer modificar VPS existente (segurança)
- ✅ Deploy em 10 minutos

**Próximos Passos:**
1. Criar network `proxy` (se não existir)
2. Criar database `apolo_dota2`
3. Configurar `.env` com secrets
4. Ajustar workflow `deploy-vps.yml` (fix SSH commands)
5. Deploy automático via GitHub Actions

---

### Para Infraestrutura CONSISTENTE (Longo Prazo):
**Escolher Opção B** - Deploy Integrado (VPS Centralizado)

**Motivo:**
- ✅ Segue padrão VPS (mantém consistência)
- ✅ Gerenciamento unificado (um docker-compose.yml)
- ✅ Backups e monitoring automáticos

**Próximos Passos:**
1. Modificar `docker-compose.yml` VPS (adicionar serviço apolo-bot)
2. Criar `/root/VPS-UPGRADE-VKM4-01-HTG-ZCB/projects/apolo/`
3. Configurar `.env` com secrets
4. Atualizar workflow GitHub (deploy para estrutura VPS)
5. Deploy manual primeira vez, depois automático

---

## 🚨 Ação Requerida

**Decisão necessária:** Qual opção de deploy você prefere?

- **Opção A**: Deploy isolado (`/root/apolo`) - mais rápido, workflow atual
- **Opção B**: Deploy integrado (VPS centralizado) - mais consistente, requer mudanças

Após decisão, posso:
1. Ajustar workflow GitHub conforme escolha
2. Criar guia passo-a-passo de deploy
3. Preparar comandos de validação

---

**Nota:** Ambas opções são válidas e **NÃO têm problema de "Docker dentro de Docker"**. A diferença é apenas organizacional.
