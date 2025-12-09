# 🏢 VPS Shared Infrastructure Integration Guide

Complete guide to integrate APOLO Dota 2 Bot into existing VPS shared infrastructure (zapclaudio.com).

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [VPS Preparation](#vps-preparation)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Rollback](#rollback)

---

## Overview

**What is VPS Shared Infrastructure?**

APOLO integrates into an existing VPS that already runs multiple applications (n8n, api-node-template, discord-bot-template) sharing common services:
- **PostgreSQL 16** (shared database server)
- **Redis 7** (shared cache server)
- **Traefik** (reverse proxy with SSL)
- **Portainer** (Docker management UI)

**Benefits:**
- 💰 Lower resource usage (no duplicate PostgreSQL/Redis)
- 🔐 Enhanced security (databases not publicly exposed)
- 📈 Easier scaling (centralized infrastructure)
- 🔄 Automatic backups (daily at 3AM via cron)
- 🚀 Zero-downtime deployments

**Isolation Guarantees:**
- ✅ Separate database: `apolo_dota2` (no access to other projects)
- ✅ Redis namespace: `apolo:*` (isolated cache keys)
- ✅ Independent container (own CPU/RAM/disk)
- ✅ Independent deployment (updating APOLO doesn't restart other projects)

---

## Architecture

### Container Structure

```
VPS Host: zapclaudio.com (31.97.103.184)
├── Network: zapclaudio-network (bridge)
│
├── Container: apolo-bot ← NEW
│   ├── Image: ghcr.io/upgrade-near-me/apolo:latest
│   ├── Port: None exposed (Discord bot doesn't need public ports)
│   ├── Metrics: 9100 (internal - for Prometheus)
│   └── Depends: postgres, redis
│
├── Container: n8n
│   ├── Port: 5678
│   └── Database: n8n_db
│
├── Container: api-node-template
│   ├── Port: 3001
│   └── Database: api_node_db
│
├── Container: discord-bot-template
│   ├── Port: 3002
│   └── Database: discord_bot_db
│
├── Container: postgres (PostgreSQL 16) ← SHARED
│   ├── Port: 5432 (internal network only)
│   ├── Databases:
│   │   ├── n8n_db
│   │   ├── api_node_db
│   │   ├── discord_bot_db
│   │   └── apolo_dota2 ← NEW
│   └── Users:
│       └── apolo_user (permissions only for apolo_dota2)
│
├── Container: redis (Redis 7) ← SHARED
│   ├── Port: 6379 (internal network only)
│   └── Namespaces:
│       ├── n8n:*
│       ├── api:*
│       ├── discord:*
│       └── apolo:* ← NEW (isolated cache keys)
│
├── Container: traefik
│   ├── Port: 80 → 443 redirect
│   ├── Port: 443 → SSL routing
│   └── Routes:
│       ├── n8n.zapclaudio.com → n8n:5678
│       ├── api.zapclaudio.com → api-node:3001
│       └── (APOLO doesn't need public route)
│
└── Container: portainer
    ├── Port: 9000
    └── Management UI
```

### Database Isolation

Each project has **its own PostgreSQL database**:

```sql
-- PostgreSQL 16 (shared container)
CREATE DATABASE apolo_dota2 OWNER apolo_user;
CREATE USER apolo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;

-- apolo_user has ZERO access to:
-- - n8n_db
-- - api_node_db
-- - discord_bot_db
```

**Connection strings:**
- APOLO: `postgresql://apolo_user:password@postgres:5432/apolo_dota2`
- n8n: `postgresql://n8n_user:password@postgres:5432/n8n_db`
- api-node: `postgresql://api_user:password@postgres:5432/api_node_db`

### Redis Isolation

Each project uses **namespace prefixes** for cache keys:

```redis
# Redis 7 (shared container)
redis:6379/
├── Keys: n8n:session:*       # n8n sessions
├── Keys: n8n:cache:*         # n8n cache
├── Keys: api:cache:*         # api-node cache
├── Keys: discord:cache:*     # discord-bot cache
└── Keys: apolo:*             # APOLO cache ← NEW
    ├── apolo:stratz:profile:12345
    ├── apolo:match:67890
    └── apolo:guild:settings:*
```

**Key pattern:**
- APOLO always uses `apolo:` prefix
- Impossible to overwrite keys from other projects
- Managed automatically by `RedisService.ts`

---

## Prerequisites

### On GitHub

- Repository: `Upgrade-Near-Me/Apolo-Dota2-Disc-Bot`
- Branch: `main` (production branch)
- Personal Access Token with:
  - `packages:write` (for GHCR push)
  - `repo` (for workflow access)

### On VPS (zapclaudio.com)

- SSH access to VPS (user: root, IP: 31.97.103.184)
- Existing services running:
  - PostgreSQL 16 container
  - Redis 7 container
  - Traefik container
  - Portainer container
- Network: `zapclaudio-network` exists
- Directory: `/root/VPS-UPGRADE-VKM4-01-HTG-ZCB/` (main docker-compose.yml location)

### API Keys

- Discord Bot Token (production)
- Stratz API Token (1-10 keys supported)
- Steam Web API Key
- Gemini API Key (1-10 keys supported)

---

## GitHub Secrets Configuration

### 1. Access Repository Settings

1. Go to: `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/settings/secrets/actions`
2. Click "New repository secret"

### 2. Required Secrets

Add these secrets one by one:

#### Docker & VPS Access

```yaml
# GitHub Container Registry (GHCR) token
GHCR_TOKEN: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Generate at: https://github.com/settings/tokens
# Permissions: packages:write

# VPS SSH access
VPS_HOST: 31.97.103.184
VPS_USER: root
VPS_SSH_KEY: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  <your_private_ssh_key_content>
  -----END OPENSSH PRIVATE KEY-----
# Generate: ssh-keygen -t ed25519 -C "apolo-deploy"
# Copy public key to VPS: ssh-copy-id root@31.97.103.184
```

#### Discord Configuration

```yaml
DISCORD_TOKEN: MTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxx
DISCORD_CLIENT_ID: 1234567890123456789
DISCORD_GUILD_ID: 9876543210987654321  # Optional: test server
```

#### Database Configuration

```yaml
# PostgreSQL 16 (shared)
APOLO_DB_USER: apolo_user
APOLO_DB_PASSWORD: your_secure_apolo_db_password_min_16_chars
APOLO_DB_NAME: apolo_dota2
DB_HOST: postgres  # Container name in docker network
DB_PORT: 5432
```

#### Redis Configuration

```yaml
# Redis 7 (shared)
REDIS_PASSWORD: your_secure_redis_password
REDIS_HOST: redis  # Container name in docker network
REDIS_PORT: 6379
REDIS_PREFIX: apolo  # Namespace prefix
```

#### API Keys

```yaml
# Stratz API (supports rotation up to 10 keys)
STRATZ_API_TOKEN_1: your_stratz_token_1
STRATZ_API_TOKEN_2: your_stratz_token_2  # Optional
STRATZ_API_TOKEN_3: your_stratz_token_3  # Optional

# Steam Web API
STEAM_API_KEY: your_steam_api_key_32_chars

# Google Gemini AI (supports rotation up to 10 keys)
GEMINI_API_KEY_1: your_gemini_api_key_1
GEMINI_API_KEY_2: your_gemini_api_key_2  # Optional
GEMINI_API_KEY_3: your_gemini_api_key_3  # Optional
```

#### Monitoring Configuration

```yaml
NODE_ENV: production
LOG_LEVEL: info
METRICS_PORT: 9100
```

### 3. Verify Secrets

After adding all secrets, verify in repository settings:

```
Settings → Secrets and variables → Actions → Repository secrets
✅ 20+ secrets configured
```

---

## VPS Preparation

### 1. SSH into VPS

```bash
ssh root@31.97.103.184
```

### 2. Create APOLO Database

```bash
# Connect to PostgreSQL container
docker exec -it postgres psql -U postgres

# Inside psql:
CREATE DATABASE apolo_dota2;
CREATE USER apolo_user WITH PASSWORD 'your_secure_apolo_db_password_min_16_chars';
GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;

# Verify
\l  # List databases (should see apolo_dota2)
\q  # Exit
```

### 3. Update VPS Docker Compose

Edit `/root/VPS-UPGRADE-VKM4-01-HTG-ZCB/docker-compose.yml`:

```yaml
# Add APOLO bot service
services:
  # ... existing services (n8n, api-node-template, etc) ...

  apolo-bot:
    image: ghcr.io/upgrade-near-me/apolo:latest
    container_name: apolo-bot
    restart: always
    
    networks:
      - zapclaudio-network
    
    environment:
      # Discord
      DISCORD_TOKEN: ${APOLO_DISCORD_TOKEN}
      DISCORD_CLIENT_ID: ${APOLO_DISCORD_CLIENT_ID}
      
      # Database (shared PostgreSQL 16)
      DATABASE_URL: postgresql://apolo_user:${APOLO_DB_PASSWORD}@postgres:5432/apolo_dota2
      
      # Redis (shared with namespace)
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      REDIS_PREFIX: apolo
      
      # APIs
      STRATZ_API_TOKEN_1: ${APOLO_STRATZ_API_TOKEN_1}
      STEAM_API_KEY: ${APOLO_STEAM_API_KEY}
      GEMINI_API_KEY_1: ${APOLO_GEMINI_API_KEY_1}
      
      NODE_ENV: production
      LOG_LEVEL: info
      METRICS_PORT: 9100
    
    expose:
      - "9100"  # Metrics (internal only)
    
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

### 4. Update VPS .env

Edit `/root/VPS-UPGRADE-VKM4-01-HTG-ZCB/.env`:

```env
# ... existing variables ...

# APOLO Bot Configuration
APOLO_DISCORD_TOKEN=your_production_discord_token
APOLO_DISCORD_CLIENT_ID=your_client_id
APOLO_DB_PASSWORD=your_secure_apolo_db_password
APOLO_STRATZ_API_TOKEN_1=your_stratz_token
APOLO_STEAM_API_KEY=your_steam_key
APOLO_GEMINI_API_KEY_1=your_gemini_key
```

### 5. Test Configuration

```bash
# Pull APOLO image
docker pull ghcr.io/upgrade-near-me/apolo:latest

# Verify docker-compose syntax
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB
docker-compose config

# Should show apolo-bot service without errors
```

---

## Deployment

### Automatic Deployment (Recommended)

**Trigger:** Push to `main` branch

```bash
# On your local machine
git push origin main

# GitHub Actions will automatically:
# 1. Run CI tests
# 2. Build Dockerfile.prod
# 3. Push image to GHCR
# 4. SSH to VPS
# 5. Pull new image
# 6. Restart apolo-bot container
```

**Monitor deployment:**
- GitHub Actions: `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/actions`
- Status: ✅ All checks passed → Bot deployed
- Time: ~5-7 minutes end-to-end

### Manual Deployment

If you need to deploy manually:

```bash
# SSH to VPS
ssh root@31.97.103.184

# Navigate to VPS directory
cd /root/VPS-UPGRADE-VKM4-01-HTG-ZCB

# Pull latest APOLO image
docker pull ghcr.io/upgrade-near-me/apolo:latest

# Restart APOLO container
docker-compose up -d apolo-bot

# Verify bot is running
docker ps | grep apolo-bot
docker logs -f apolo-bot
```

### First Deployment (Database Setup)

After first deployment, run migrations:

```bash
# SSH to VPS
ssh root@31.97.103.184

# Run database migrations
docker exec -it apolo-bot npx tsx src/database/migrate.ts

# Expected output:
# ✅ Running migrations...
# ✅ Migration 002_v2_dashboard_tables.sql completed
# ✅ Migration 007_imp_score.sql completed
# ✅ Migration 008_leveling_xp.sql completed
# ✅ Migration 009_match_awards.sql completed
# ✅ All migrations completed successfully

# Deploy Discord commands
docker exec -it apolo-bot npx tsx src/deploy-commands.ts

# Expected output:
# ✅ Successfully registered 3 application commands globally
# - dashboard
# - setup-apolo-structure
# - remove-apolo-structure
```

### Verify Deployment

```bash
# Check container status
docker ps | grep apolo-bot
# Should show: Up X minutes (healthy)

# Check logs
docker logs --tail=50 apolo-bot
# Should show:
# 🚀 Starting APOLO Dota 2 Bot...
# ✅ Connected to PostgreSQL database
# ✅ Connected to Redis
# 🤖 Bot online as APOLO - Dota2#XXXX
# 🎉 Bot fully initialized and ready!

# Check health endpoint
docker exec apolo-bot curl -f http://localhost:9100/health
# Should return: {"status":"ok","uptime":123}
```

---

## Monitoring

### Container Logs

```bash
# Real-time logs
docker logs -f apolo-bot

# Last 100 lines
docker logs --tail=100 apolo-bot

# Logs with timestamps
docker logs --timestamps apolo-bot

# Logs since 1 hour ago
docker logs --since 1h apolo-bot
```

### Health Checks

```bash
# Check container health
docker inspect apolo-bot | grep -A 5 Health

# Manual health check
docker exec apolo-bot curl http://localhost:9100/health
```

### Prometheus Metrics

APOLO exposes Prometheus metrics on port 9100 (internal):

```bash
# Access metrics (from VPS)
docker exec apolo-bot curl http://localhost:9100/metrics

# Key metrics:
# - discord_commands_total (command usage)
# - command_latency_seconds (performance)
# - stratz_api_requests_total (API calls)
# - redis_cache_hit_total (cache efficiency)
# - database_query_duration_seconds (DB performance)
```

### Resource Usage

```bash
# Container stats
docker stats apolo-bot

# Expected:
# CPU: 5-15% (idle), 30-50% (active)
# Memory: 150-300 MB
# Network: Varies based on activity
```

### Discord Bot Status

Check Discord:
- Bot should appear **Online** as "APOLO - Dota2"
- Slash commands should appear when typing `/`
- Bot should respond to interactions

---

## Troubleshooting

### Bot Container Not Starting

```bash
# Check logs for errors
docker logs --tail=100 apolo-bot

# Common issues:
# 1. Database connection error → Check DATABASE_URL in docker-compose.yml
# 2. Redis connection error → Check REDIS_URL and REDIS_PREFIX
# 3. Discord token invalid → Verify DISCORD_TOKEN secret
# 4. Missing environment variables → Check .env file
```

### Database Connection Error

```bash
# Test PostgreSQL connection
docker exec -it postgres psql -U apolo_user -d apolo_dota2

# If fails:
# 1. Verify user exists:
docker exec -it postgres psql -U postgres -c "\du"

# 2. Verify database exists:
docker exec -it postgres psql -U postgres -c "\l"

# 3. Grant permissions again:
docker exec -it postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE apolo_dota2 TO apolo_user;"
```

### Redis Connection Error

```bash
# Test Redis connection
docker exec -it redis redis-cli -a ${REDIS_PASSWORD} ping
# Should return: PONG

# Test APOLO namespace
docker exec -it redis redis-cli -a ${REDIS_PASSWORD} KEYS "apolo:*"
# Should list APOLO cache keys
```

### Discord Commands Not Appearing

```bash
# Re-deploy commands
docker exec -it apolo-bot npx tsx src/deploy-commands.ts

# Wait 5-10 minutes for Discord global cache
# Or use DISCORD_GUILD_ID for instant guild-only deployment

# Restart Discord client (desktop/web)
# Sometimes Discord cache needs clearing
```

### Bot Responding Slowly

```bash
# Check API latency in logs
docker logs apolo-bot | grep "API"

# Check Redis cache hit rate
docker exec apolo-bot curl http://localhost:9100/metrics | grep redis_cache

# If cache hit rate < 50%:
# - Increase Redis TTL in RedisService.ts
# - Check Redis memory: docker stats redis
```

### Deployment Failed (GitHub Actions)

1. **Go to Actions tab:** `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/actions`
2. **Click failed workflow**
3. **Check error logs:**
   - Build failed → Check Dockerfile.prod syntax
   - Push failed → Check GHCR_TOKEN permissions
   - SSH failed → Check VPS_SSH_KEY format
   - Deployment failed → Check VPS docker-compose.yml

### Other Projects Affected

**This should NEVER happen** (containers are isolated), but if it does:

```bash
# Check all containers
docker ps -a

# Restart affected container (example: n8n)
docker-compose restart n8n

# Check logs for interference
docker logs n8n | grep -i error

# Verify network isolation
docker network inspect zapclaudio-network
```

---

## Rollback

### Rollback to Previous Version

```bash
# SSH to VPS
ssh root@31.97.103.184

# List APOLO image tags
docker images | grep apolo

# Pull specific version
docker pull ghcr.io/upgrade-near-me/apolo:v2.1.0

# Update docker-compose.yml
# Change: image: ghcr.io/upgrade-near-me/apolo:latest
# To: image: ghcr.io/upgrade-near-me/apolo:v2.1.0

# Restart container
docker-compose up -d apolo-bot
```

### Emergency Stop

```bash
# Stop APOLO container
docker-compose stop apolo-bot

# Or remove completely
docker-compose rm -f apolo-bot

# Other projects continue running normally
```

### Database Rollback

```bash
# Backup exists at: /root/backups/postgres/apolo_dota2_YYYY-MM-DD.sql

# Restore from backup
docker exec -i postgres psql -U apolo_user apolo_dota2 < /root/backups/postgres/apolo_dota2_2025-12-08.sql
```

---

## Best Practices

### Security

- ✅ Never expose PostgreSQL/Redis ports publicly
- ✅ Use strong passwords (min 16 chars, mixed case, numbers, symbols)
- ✅ Rotate API keys regularly (Stratz, Gemini support 1-10 keys)
- ✅ Keep secrets in GitHub Secrets (never commit to git)
- ✅ Use read-only filesystem for container (security)

### Performance

- ✅ Monitor Redis cache hit rate (target: >80%)
- ✅ Check command latency (target: <2.5s)
- ✅ Monitor PostgreSQL connection pool usage
- ✅ Review Prometheus dashboards weekly

### Maintenance

- ✅ Check logs daily: `docker logs apolo-bot | grep ERROR`
- ✅ Verify backups: `/root/backups/postgres/` (daily at 3AM)
- ✅ Update dependencies monthly: `npm outdated`
- ✅ Monitor disk space: `df -h`

### Deployment

- ✅ Test locally before pushing to main
- ✅ Run tests: `npm run test:unit && npm run test:e2e`
- ✅ Build TypeScript: `npm run build`
- ✅ Monitor GitHub Actions after push
- ✅ Verify bot online in Discord within 5 minutes

---

## Support

For help:

- **GitHub Issues:** `https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/issues`
- **Documentation:** `/docs` directory
- **VPS Isolated Deployment:** `docs/deployment/VPS_DEPLOYMENT_GUIDE.md`
- **Local Development:** `docs/setup/SETUP.md`

---

**Last Updated:** December 8, 2025  
**Maintained by:** PKT Gamers & Upgrade Near ME  
**VPS Host:** zapclaudio.com (31.97.103.184)
