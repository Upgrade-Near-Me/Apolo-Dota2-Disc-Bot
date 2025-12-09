# 🧪 Local Testing Guide - APOLO Dota 2 Bot

Complete guide for testing the bot locally before deploying to VPS.

---

## 📋 Prerequisites

Ensure you have:
- ✅ Node.js v20.18.1+ installed
- ✅ Docker Desktop installed and running
- ✅ Git Bash or WSL (for running `.sh` scripts on Windows)
- ✅ Discord Bot Token (from Discord Developer Portal)
- ✅ Optional: API keys (Stratz, Steam, Gemini)

---

## 🚀 Step 1: Environment Setup

### 1.1 Configure Environment Variables

```powershell
# Copy example environment file
Copy-Item .env.example .env

# Edit .env with your credentials
notepad .env
```

**Required variables:**
```env
# Discord (REQUIRED)
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id  # For instant command deployment

# Database (Docker auto-configured)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2

# Redis (Docker auto-configured)
REDIS_HOST=redis
REDIS_PORT=6379

# API Keys (Optional but recommended for full features)
STRATZ_API_TOKEN_1=your_stratz_token
STEAM_API_KEY=your_steam_key
GEMINI_API_KEY_1=your_gemini_key
```

---

## 🐳 Step 2: Start Docker Stack

### 2.1 Start All Services

```powershell
# Build and start containers
docker-compose up -d --build

# Check all services are running
docker-compose ps
```

**Expected output:**
```
NAME                STATUS              PORTS
apolo-bot          Up 10 seconds       
apolo-postgres     Up 10 seconds       0.0.0.0:5432->5432/tcp
apolo-redis        Up 10 seconds       0.0.0.0:6379->6379/tcp
apolo-prometheus   Up 10 seconds       0.0.0.0:9091->9090/tcp
apolo-grafana      Up 10 seconds       0.0.0.0:3000->3000/tcp
```

### 2.2 View Bot Logs

```powershell
# Follow bot logs in real-time
docker-compose logs -f bot
```

**Healthy logs:**
```
🚀 Starting APOLO Dota 2 Bot...
✅ Connected to PostgreSQL database
📂 Loading 3 command files...
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
✅ Loaded command: remove-apolo-structure
🤖 Bot online as APOLO - Dota2#0567
📊 Serving 1 servers
🎉 Bot fully initialized and ready!
```

---

## 🗄️ Step 3: Database Setup

### 3.1 Run Migrations

```powershell
# Run database migrations
docker-compose exec bot npx tsx src/database/migrate.ts
```

**Expected output:**
```
🔄 Running database migrations...
✅ Created table: users
✅ Created table: guild_settings
✅ Created table: matches
✅ Created table: server_stats
✅ Created table: player_xp
✅ Created table: match_awards
✅ Migrations completed successfully!
```

### 3.2 Verify Database Connection

```powershell
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d apolo_dota2

# List tables
\dt

# Check schema
\d users

# Exit
\q
```

---

## 🎮 Step 4: Deploy Discord Commands

### 4.1 Deploy to Test Server

```powershell
# Deploy commands (uses DISCORD_GUILD_ID from .env for instant deployment)
docker-compose exec bot npx tsx src/deploy-commands.ts
```

**Expected output:**
```
🚀 Deploying commands to Discord...
✅ Deployed 3 commands to guild 1234567890
Commands deployed:
  - /dashboard
  - /setup-apolo-structure
  - /remove-apolo-structure
```

### 4.2 Verify in Discord

1. Open your test Discord server
2. Type `/` in any channel
3. Verify bot commands appear:
   - `/dashboard`
   - `/setup-apolo-structure`
   - `/remove-apolo-structure`

---

## ✅ Step 5: Test Core Features

### 5.1 Setup Bot Structure

1. Run `/setup-apolo-structure` in Discord
2. Verify 8 channels created:
   - 🔗・connect
   - 👤・profile
   - 📊・reports
   - 🤖・ai-analyst
   - 🎯・meta-builds
   - 📹・content-hub
   - 🔎・find-team
   - 🏆・server-ranking

### 5.2 Test Dashboard

1. Run `/dashboard` in Discord
2. Verify interactive menu appears with 12 buttons
3. Click "ℹ️ Help" button
4. Verify help message appears

### 5.3 Test Steam Connection

1. Go to **🔗・connect** channel
2. Click "🔗 Connect Steam" button
3. Enter your Steam ID in modal
4. Verify OpenDota profile verification works
5. Confirm connection
6. Verify success message

### 5.4 Test Profile Features

1. Go to **👤・profile** channel
2. Click "👤 View Profile" button
3. Verify profile embed appears with stats
4. Test other buttons:
   - 📊 Match History
   - 🎮 Hero Pool
   - 📈 Progress

---

## 💾 Step 6: Test Database Backup

### 6.1 Create Manual Backup

**On Windows (using Git Bash):**
```bash
cd "x:/UP PROJECT - Bots DISCORD/BOT DISC - APOLO DOTA2"
bash scripts/backup-postgres.sh
```

**Expected output:**
```
[2024-12-08 15:30:00] Starting PostgreSQL backup...
[INFO] Dumping database...
[SUCCESS] Backup created: apolo_20241208_153000.sql.gz (1.2M)
[INFO] Total backups stored: 1
[2024-12-08 15:30:05] Backup completed successfully!
```

### 6.2 Verify Backup File

```powershell
# Check backup was created
ls backups/

# Check backup size
Get-ChildItem backups/ | Select-Object Name, Length
```

### 6.3 Test Restore

```bash
# List available backups
bash scripts/restore-postgres.sh

# Restore from backup
bash scripts/restore-postgres.sh apolo_20241208_153000.sql.gz
```

---

## 📊 Step 7: Monitor Bot Health

### 7.1 Access Grafana Dashboards

```
http://localhost:3000
```

**Login:**
- Username: `admin`
- Password: `admin` (change on first login)

**Dashboards to check:**
1. **APOLO Bot Overview** - Command usage, errors, latency
2. **Discord.js Metrics** - WebSocket, guilds, users
3. **PostgreSQL Performance** - Queries, connections
4. **Redis Cache** - Hit rate, memory usage

### 7.2 Check Prometheus Metrics

```
http://localhost:9091
```

**Verify metrics:**
- `apolo_commands_total` - Command execution count
- `apolo_command_duration_seconds` - Command latency
- `apolo_errors_total` - Error count
- `apolo_api_requests_total` - External API calls

---

## 🧪 Step 8: Run Test Suite

### 8.1 Unit Tests

```powershell
# Run unit tests
npm run test:unit

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

**Expected:**
```
✓ tests/unit/teamBalancer.test.ts (12 tests)
  ✓ Snake Draft Algorithm
  ✓ Edge Cases
  ✓ Realistic Scenarios

Test Files: 1 passed (1)
Tests: 12 passed (12)
Coverage: 100%
```

### 8.2 E2E API Tests

```powershell
# Run E2E tests (requires API keys in .env)
npm run test:e2e
```

**Expected:**
```
✓ tests/e2e/stratz.test.ts (15 tests)
✓ tests/e2e/opendota.test.ts (20 tests)
✓ tests/e2e/steam.test.ts (10 tests)

Test Files: 3 passed (3)
Tests: 45 passed (45)
```

---

## 🔍 Step 9: Troubleshooting

### Bot Not Starting

**Check logs:**
```powershell
docker-compose logs bot
```

**Common issues:**
- ❌ Invalid `DISCORD_TOKEN` → Check token in .env
- ❌ PostgreSQL not ready → Wait 10 seconds, retry
- ❌ Port conflict → Check no other bot running

**Solution:**
```powershell
# Restart bot
docker-compose restart bot
```

---

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```powershell
# Check PostgreSQL is running
docker-compose ps postgres

# If stopped, start it
docker-compose up -d postgres

# Check DATABASE_URL in .env uses 'postgres' hostname
# Correct: postgresql://postgres:postgres@postgres:5432/apolo_dota2
# Wrong:   postgresql://postgres:postgres@localhost:5432/apolo_dota2
```

---

### Commands Not Appearing in Discord

**Solution:**
```powershell
# 1. Verify DISCORD_GUILD_ID is set in .env
# 2. Re-deploy commands
docker-compose exec bot npx tsx src/deploy-commands.ts

# 3. Restart Discord client (clear cache)
# 4. Wait 5 minutes for Discord cache refresh
```

---

### Docker Build Fails

**Error:** `failed to solve: executor failed running`

**Solution:**
```powershell
# Clean Docker cache
docker-compose down -v
docker system prune -af

# Rebuild from scratch
docker-compose build --no-cache --pull
docker-compose up -d
```

---

## 📋 Step 10: Testing Checklist

Before deploying to VPS, verify:

**Core Functionality:**
- [ ] Bot connects to Discord successfully
- [ ] PostgreSQL database accessible
- [ ] Redis cache working
- [ ] All 3 slash commands deploy
- [ ] Dashboard opens with 12 buttons
- [ ] 8 channels created by setup command

**User Features:**
- [ ] Steam connection flow works
- [ ] Profile displays correctly
- [ ] Match analysis generates images
- [ ] Progress charts render
- [ ] Leaderboard updates
- [ ] AI Coach responds

**Database:**
- [ ] Migrations run successfully
- [ ] Data persists after bot restart
- [ ] Backup script creates `.sql.gz` file
- [ ] Restore script works correctly
- [ ] No data loss after restore

**Monitoring:**
- [ ] Grafana dashboards load
- [ ] Prometheus metrics updating
- [ ] Bot logs are clean (no errors)
- [ ] Command latency < 2 seconds

**Testing:**
- [ ] Unit tests pass (502 tests)
- [ ] E2E tests pass (90 tests)
- [ ] Build completes with 0 errors
- [ ] TypeScript compiles successfully

---

## 🚀 Step 11: Ready for VPS Deployment

Once all tests pass locally, proceed with VPS deployment:

```powershell
# 1. Commit all changes
git add .
git commit -m "test: local testing complete, ready for VPS deployment"
git push origin main

# 2. Follow VPS deployment guide
# See: docs/deployment/VPS_DEPLOYMENT_GUIDE.md
```

---

## 🎯 Performance Benchmarks (Local)

**Expected metrics on modern PC:**

| Metric | Target | Acceptable |
|--------|--------|------------|
| Bot startup | < 5s | < 10s |
| Dashboard load | < 500ms | < 1s |
| Match analysis | < 2s | < 3s |
| Profile display | < 1.5s | < 2.5s |
| Database query | < 10ms | < 50ms |
| Redis cache hit | < 5ms | < 10ms |

---

## 📞 Need Help?

**Check logs:**
```powershell
# Bot logs
docker-compose logs -f bot

# All services
docker-compose logs -f

# PostgreSQL logs
docker-compose logs postgres

# Redis logs
docker-compose logs redis
```

**Reset everything:**
```powershell
# Nuclear option - delete all data and start fresh
docker-compose down -v
rm -rf backups/*
docker-compose up -d --build
docker-compose exec bot npx tsx src/database/migrate.ts
docker-compose exec bot npx tsx src/deploy-commands.ts
```

---

**Last Updated:** December 8, 2024  
**Status:** Local Testing Ready ✅
