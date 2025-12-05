# 🐳 Docker Deployment Guide

Complete guide for deploying Apolo Dota 2 Bot using Docker and Docker Compose.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Container Management](#container-management)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

### Required Software

**Windows:**

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- WSL2 enabled (Docker Desktop handles this)

**Linux:**

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**macOS:**

- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

### Verify Installation

```powershell
# Check Docker version
docker --version
# Output: Docker version 24.0.0+

# Check Docker Compose version
docker-compose --version
# Output: Docker Compose version v2.20.0+

# Verify Docker is running
docker ps
# Should show empty list (not error)
```

## Quick Start

### 1. Configure Environment

```powershell
# Copy template
Copy-Item .env.example .env

# Edit with your credentials
notepad .env
```

**Required Variables:**

```env
# Discord Bot
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id

# API Keys
STRATZ_API_TOKEN=your_stratz_token
STEAM_API_KEY=your_steam_key
GEMINI_API_KEY=your_gemini_key

# Database (auto-configured in docker-compose)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2
```

**Note:** `DATABASE_URL` uses `postgres` as hostname (container name), not `localhost`.

### 2. Start Services

```powershell
# Build and start all containers
docker-compose up -d
```

**What This Does:**

1. Creates `postgres` container (PostgreSQL 14)
2. Waits for database to be healthy
3. Builds `bot` container from Dockerfile
4. Starts bot and connects to database

### 3. Run Migrations

```powershell
# Create database tables
docker-compose exec bot node src/database/migrate.js
```

### 4. Deploy Commands

```powershell
# Register Discord slash commands
docker-compose exec bot node src/deploy-commands.js
```

### 5. Verify

```powershell
# Check logs
docker-compose logs -f bot
```

**Expected Output:**

```
bot_1       | ✅ Loaded command: dashboard
bot_1       | ✅ Loaded command: setup-apolo-structure
bot_1       | ✅ Connected to PostgreSQL database
bot_1       | 🤖 Bot online as ApoloBot#1234
bot_1       | 📊 Serving 1 servers
```

## Configuration

### docker-compose.yml Overview

```yaml
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: apolo_dota2
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  bot:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2
      - STRATZ_API_TOKEN=${STRATZ_API_TOKEN}
      - STEAM_API_KEY=${STEAM_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./src:/app/src
    restart: unless-stopped

volumes:
  postgres_data:
```

### Dockerfile Overview

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source code
COPY . .

# Start bot
CMD ["node", "src/index.js"]
```

### Volume Mounts

**postgres_data:**

- Persists database data
- Survives container restarts
- Located in Docker's volume storage

**./src:/app/src:**

- Mounts local `src` directory
- Enables live code changes (restart required)
- Development convenience

## Container Management

### Starting Services

**Start all containers:**

```powershell
docker-compose up -d
```

**Start specific service:**

```powershell
docker-compose up -d bot
docker-compose up -d postgres
```

**Start with logs (foreground):**

```powershell
docker-compose up
```

### Stopping Services

**Stop all containers:**

```powershell
docker-compose down
```

**Stop specific service:**

```powershell
docker-compose stop bot
docker-compose stop postgres
```

**Stop and remove volumes (WARNING: deletes data):**

```powershell
docker-compose down -v
```

### Restarting Services

**Restart all:**

```powershell
docker-compose restart
```

**Restart bot only:**

```powershell
docker-compose restart bot
```

**After code changes:**

```powershell
# Rebuild and restart
docker-compose up -d --build
```

### Viewing Logs

**All services:**

```powershell
docker-compose logs -f
```

**Bot only:**

```powershell
docker-compose logs -f bot
```

**Postgres only:**

```powershell
docker-compose logs -f postgres
```

**Last 50 lines:**

```powershell
docker-compose logs --tail=50 bot
```

### Checking Status

**Container status:**

```powershell
docker-compose ps
```

**Output Example:**

```
NAME                       STATUS          PORTS
apolo-bot-1                Up 5 minutes
apolo-postgres-1           Up 5 minutes    5432/tcp
```

**Resource usage:**

```powershell
docker stats
```

## Database Operations

### Accessing Database

**Via Docker Exec:**

```powershell
# Open psql shell
docker-compose exec postgres psql -U postgres -d apolo_dota2
```

**Common psql Commands:**

```sql
-- List tables
\dt

-- Describe table
\d users

-- Query data
SELECT * FROM guild_settings;

-- Exit
\q
```

### Running Migrations

**Initial setup:**

```powershell
docker-compose exec bot node src/database/migrate.js
```

**After schema changes:**

```powershell
# Restart bot to apply
docker-compose restart bot

# Run migrations
docker-compose exec bot node src/database/migrate.js
```

### Backup Database

**Create backup:**

```powershell
# Backup to file
docker-compose exec -T postgres pg_dump -U postgres apolo_dota2 > backup.sql
```

**Restore from backup:**

```powershell
# Restore from file
Get-Content backup.sql | docker-compose exec -T postgres psql -U postgres -d apolo_dota2
```

### Reset Database

**WARNING: Deletes all data!**

```powershell
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for postgres healthy
Start-Sleep -Seconds 10

# Run migrations
docker-compose exec bot node src/database/migrate.js
```

## Troubleshooting

### Container Won't Start

**Problem:** `docker-compose up` fails

**Solutions:**

1. **Check logs:**

   ```powershell
   docker-compose logs bot
   docker-compose logs postgres
   ```

2. **Verify .env file:**

   ```powershell
   Get-Content .env
   # Check for missing variables
   ```

3. **Check port conflicts:**

   ```powershell
   # Check if port 5432 in use
   netstat -ano | findstr :5432
   ```

4. **Rebuild containers:**

   ```powershell
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Bot Disconnects Frequently

**Problem:** Bot goes offline repeatedly

**Solutions:**

1. **Check bot logs:**

   ```powershell
   docker-compose logs --tail=100 bot
   # Look for error messages
   ```

2. **Verify environment variables:**

   ```powershell
   docker-compose exec bot env | grep DISCORD
   ```

3. **Increase restart delay:**

   Edit `docker-compose.yml`:

   ```yaml
   bot:
     restart: unless-stopped
     restart_policy:
       delay: 30s
   ```

4. **Check memory limits:**

   ```powershell
   docker stats apolo-bot-1
   # Ensure not hitting limits
   ```

### Database Connection Failed

**Problem:** "Connection refused" or "Connection timeout"

**Solutions:**

1. **Check postgres health:**

   ```powershell
   docker-compose ps
   # postgres should show "healthy"
   ```

2. **Verify DATABASE_URL:**

   Must use `postgres` hostname (not `localhost`):

   ```env
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2
   ```

3. **Test connection:**

   ```powershell
   docker-compose exec bot node -e "import('pg').then(({default: pg}) => new pg.Pool({connectionString: process.env.DATABASE_URL}).query('SELECT 1'))"
   ```

4. **Check network:**

   ```powershell
   docker network ls
   docker network inspect apolo-dota2_default
   ```

### Volume Permission Issues

**Problem:** "Permission denied" errors

**Solutions (Linux):**

1. **Fix ownership:**

   ```bash
   sudo chown -R $USER:$USER .
   ```

2. **Adjust Dockerfile:**

   ```dockerfile
   USER node
   ```

3. **Use named volumes** instead of bind mounts

### Build Errors

**Problem:** Docker build fails

**Solutions:**

1. **Clear build cache:**

   ```powershell
   docker-compose build --no-cache
   ```

2. **Check Dockerfile syntax:**

   ```powershell
   docker-compose config
   ```

3. **Verify base image:**

   ```powershell
   docker pull node:20-alpine
   ```

4. **Check disk space:**

   ```powershell
   docker system df
   ```

### Memory Issues

**Problem:** Out of memory errors

**Solutions:**

1. **Check memory usage:**

   ```powershell
   docker stats
   ```

2. **Increase Docker memory:**

   - Docker Desktop → Settings → Resources
   - Increase memory allocation (4GB recommended)

3. **Add memory limits:**

   Edit `docker-compose.yml`:

   ```yaml
   bot:
     mem_limit: 512m
     mem_reservation: 256m
   ```

## Production Deployment

### Security Best Practices

**1. Environment Variables:**

```yaml
# Use secrets management
secrets:
  discord_token:
    file: ./secrets/discord_token.txt

services:
  bot:
    secrets:
      - discord_token
```

**2. Non-root User:**

```dockerfile
# Add to Dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bot -u 1001
USER bot
```

**3. Read-only Filesystem:**

```yaml
bot:
  read_only: true
  tmpfs:
    - /tmp
```

### Optimization

**1. Multi-stage Build:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "src/index.js"]
```

**2. Resource Limits:**

```yaml
bot:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

### Monitoring

**1. Health Checks:**

```yaml
bot:
  healthcheck:
    test: ["CMD", "node", "-e", "process.exit(0)"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**2. Logging:**

```yaml
bot:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

### Updating

**Update bot code:**

```powershell
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

**Update dependencies:**

```powershell
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

**Update base image:**

```powershell
# Pull latest Node.js
docker pull node:20-alpine

# Rebuild
docker-compose build --pull
docker-compose up -d
```

## Railway Deployment

Alternative to self-hosting.

### Setup

1. **Install Railway CLI:**

   ```powershell
   npm i -g @railway/cli
   ```

2. **Login:**

   ```powershell
   railway login
   ```

3. **Create project:**

   ```powershell
   railway init
   ```

4. **Add PostgreSQL:**

   ```powershell
   railway add postgres
   ```

5. **Set variables:**

   Go to Railway dashboard → Variables:

   ```
   DISCORD_TOKEN=...
   DISCORD_CLIENT_ID=...
   STRATZ_API_TOKEN=...
   STEAM_API_KEY=...
   GEMINI_API_KEY=...
   ```

6. **Deploy:**

   ```powershell
   railway up
   ```

### Railway vs Docker

| Feature | Docker (Self-hosted) | Railway |
|---------|---------------------|---------|
| Cost | Free (your resources) | $5/month |
| Setup | Complex | Simple |
| Scaling | Manual | Automatic |
| Backups | Manual | Automatic |
| Updates | Manual | Git push |

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Railway Documentation](https://docs.railway.app/)

## Support

Issues with Docker deployment?

- [Setup Guide](SETUP.md) - Installation help
- [Troubleshooting](#troubleshooting) - Common issues
- [GitHub Issues](https://github.com/your-repo/issues) - Report bugs

---

**Prefer Docker for production deployments!** 🐳
