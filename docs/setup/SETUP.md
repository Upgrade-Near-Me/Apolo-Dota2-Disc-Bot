# 🚀 Setup Guide - APOLO Dota 2 Bot

Complete installation guide for deploying APOLO Dota 2 Bot. Choose between Quick Start (5 minutes) or Docker deployment.

## Table of Contents

- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Detailed Setup](#detailed-setup)
- [Docker Deployment](#docker-deployment)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (5 Minutes)

Get the bot running fast with this streamlined guide.

### Prerequisites

- [Node.js v20+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

### Step 1: Discord Bot (2 min)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name it "APOLO Dota 2"
3. **Bot Tab:**
   - Click **"Reset Token"** → Copy and save it
   - Enable: Presence Intent, Server Members Intent, Message Content Intent
4. **OAuth2 → URL Generator:**
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Administrator` (or specific: Send Messages, Embed Links, Attach Files, Move Members)
   - Copy URL → Open in browser → Add to your server

**Save:** Bot Token + Application ID

### Step 2: API Keys (2 min)

| Service | Required | Get Key |
|---------|----------|---------|
| **Stratz** | ✅ Yes | [stratz.com/api](https://stratz.com/api) |
| **Gemini AI** | ✅ Yes | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **Steam** | ⚠️ Optional | [Steam Dev](https://steamcommunity.com/dev/apikey) |

### Step 3: Setup (1 min)

```powershell
# Clone repository
git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
cd Apolo-Dota2-Disc-Bot

# Install dependencies
npm install

# Configure environment
Copy-Item .env.example .env
notepad .env
```

**Edit `.env` with your tokens:**

```env
# Discord
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_GUILD_ID=your_test_server_id  # Optional: instant deploy

# APIs
STRATZ_API_TOKEN_1=your_stratz_token
GEMINI_API_KEY_1=your_gemini_key
STEAM_API_KEY=your_steam_key_optional

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/apolo_dota2
```

**Tip:** Bot supports pools of up to 10 API keys (_1.._10) for rate limiting.

### Step 4: Database (30 sec)

```powershell
# Create database
createdb -U postgres apolo_dota2

# Run migrations
npm run db:migrate
```

### Step 5: Launch (30 sec)

```powershell
# Deploy Discord commands
npm run deploy

# Start bot
npm start
```

### ✅ Success!

You should see:

```
✅ Connected to PostgreSQL database
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
🤖 Bot online as APOLO#1234
📊 Serving 1 servers
```

**First test:** Type `/dashboard` in Discord!

---

## Detailed Setup

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v20.0.0 | v20.18.1+ |
| PostgreSQL | 14.0 | 16.0+ |
| RAM | 512MB | 1GB+ |
| Storage | 200MB | 500MB+ |

### Discord Bot Configuration

#### 1. Create Application

1. Navigate to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name: "APOLO Dota 2" (or your choice)
4. Click **"Create"**

#### 2. Bot Settings

**Bot Tab:**
- Click **"Reset Token"** → **Copy token immediately** (shown once)
- Under "Privileged Gateway Intents":
  - ✅ **Presence Intent** - Track user status
  - ✅ **Server Members Intent** - Access member list
  - ✅ **Message Content Intent** - Read message content

#### 3. Bot Permissions

**OAuth2 → URL Generator:**

**Scopes:**
- ✅ `bot`
- ✅ `applications.commands`

**Bot Permissions (Recommended: Administrator):**

Or specific permissions:
- View Channels
- Send Messages
- Send Messages in Threads
- Embed Links
- Attach Files
- Read Message History
- Use External Emojis
- Add Reactions
- Move Members (for team balancer)
- Manage Channels (for `/setup-apolo-structure`)

**Generated URL:** Copy and open in browser → Select server

### API Keys Setup

#### Stratz API (Required)

**Purpose:** Primary Dota 2 match data source

1. Visit [https://stratz.com/api](https://stratz.com/api)
2. Sign up (can use Discord or Steam)
3. Navigate to **"API Keys"**
4. Click **"Generate New Token"**
5. Copy token → Save in `.env`

**Free Tier:** 1,000 requests/day

**Rate Limiting:** Bot supports up to 10 tokens:
```env
STRATZ_API_TOKEN_1=first_token
STRATZ_API_TOKEN_2=second_token
# ...up to _10
```

#### Google Gemini AI (Required)

**Purpose:** AI-powered coaching and analysis

1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click **"Create API Key"**
4. Select or create project
5. Copy key → Save in `.env`

**Free Tier:** 60 requests/minute

**Rate Limiting:** Supports up to 10 keys:
```env
GEMINI_API_KEY_1=first_key
GEMINI_API_KEY_2=second_key
# ...up to _10
```

#### Steam Web API (Optional)

**Purpose:** Steam profile validation and hero images

1. Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Login with Steam
3. Domain: `localhost` (for development)
4. Generate key → Save in `.env`

**Note:** Bot can function without Steam API using OpenDota fallback.

### Database Configuration

#### PostgreSQL Installation

**Windows:**
1. Download [PostgreSQL installer](https://www.postgresql.org/download/windows/)
2. Run installer → Use defaults
3. Set password for `postgres` user
4. Port: 5432 (default)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Create Database

```powershell
# Windows (with PostgreSQL in PATH)
createdb -U postgres apolo_dota2

# Or use SQL
psql -U postgres
CREATE DATABASE apolo_dota2;
\q
```

#### Database URL Format

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Examples:
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/apolo_dota2
DATABASE_URL=postgresql://apolouser:secure_pass@postgres-server:5432/apolo_dota2
```

### Environment Variables

**Complete `.env` reference:**

```env
# ============================================
# DISCORD BOT CONFIGURATION
# ============================================
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id  # Optional: instant command deployment

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/apolo_dota2

# ============================================
# REDIS CONFIGURATION (Optional)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Leave empty if no password

# ============================================
# API KEYS - Dota 2 Data
# ============================================
# Stratz (Required) - Supports _1.._10 for rate limiting
STRATZ_API_TOKEN_1=your_stratz_token
STRATZ_API_TOKEN_2=  # Optional: additional tokens
STRATZ_API_TOKEN_3=

# Steam Web API (Optional)
STEAM_API_KEY=your_steam_key

# ============================================
# AI COACHING API KEY
# ============================================
# Google Gemini (Required) - Supports _1.._10
GEMINI_API_KEY_1=your_gemini_key
GEMINI_API_KEY_2=  # Optional: additional keys

# ============================================
# MONITORING & METRICS
# ============================================
NODE_ENV=development  # or 'production'
LOG_LEVEL=info  # debug, info, warn, error
METRICS_PORT=9100  # Prometheus metrics endpoint
```

### Installation Steps

#### 1. Clone Repository

```powershell
git clone https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot.git
cd Apolo-Dota2-Disc-Bot
```

#### 2. Install Dependencies

```powershell
npm install
```

**What gets installed:**
- discord.js v14 - Discord API
- @napi-rs/canvas - Image generation
- pg - PostgreSQL client
- ioredis - Redis client
- TypeScript - Type safety
- 40+ other dependencies

#### 3. Configure Environment

```powershell
Copy-Item .env.example .env
notepad .env
```

Fill all required fields (see [Environment Variables](#environment-variables))

#### 4. Database Migration

```powershell
npm run db:migrate
```

**Creates tables:**
- `users` - Discord ↔ Steam linking
- `guild_settings` - Server preferences
- `matches` - Match history cache
- `server_stats` - Leaderboard data
- `match_imp_scores` - IMP score system
- `match_awards` - Achievement tracking
- `user_xp` - Leveling system
- `xp_events` - XP transaction log

#### 5. Deploy Commands

```powershell
# Global deployment (5-10 min propagation)
npm run deploy

# OR guild-only (instant, for testing)
# Add DISCORD_GUILD_ID to .env first
npm run deploy:guilds
```

#### 6. Start Bot

```powershell
# Production mode
npm start

# Development mode (auto-reload)
npm run dev
```

---

## Docker Deployment

Recommended for production and easier management.

### Prerequisites

**Windows/macOS:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Docker Setup

#### 1. Configure Environment

```powershell
Copy-Item .env.example .env
notepad .env
```

**Important for Docker:**
```env
# Use container hostname (not localhost)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2
REDIS_HOST=redis
```

#### 2. Start Containers

```powershell
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f bot
```

**What gets created:**
- `apolo-postgres` - PostgreSQL 14
- `apolo-redis` - Redis 7
- `apolo-bot` - Node.js application

#### 3. Run Migrations

```powershell
docker-compose exec bot npm run db:migrate
```

#### 4. Deploy Commands

```powershell
docker-compose exec bot npm run deploy
```

### Docker Management

```powershell
# View running containers
docker-compose ps

# View logs
docker-compose logs -f bot
docker-compose logs -f postgres

# Restart services
docker-compose restart bot

# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

### Production Docker

Use `docker-compose.prod.yml` for production:

```powershell
docker-compose -f docker-compose.prod.yml up -d
```

**Production features:**
- Healthchecks
- Restart policies
- Resource limits
- Prometheus + Grafana monitoring

---

## Verification

### Check Bot Status

**Discord:**
1. Bot should appear online (green status)
2. Type `/` → Should see 4 commands:
   - `/dashboard`
   - `/setup-apolo-structure`
   - `/remove-apolo-structure`
   - `/xp-admin`

**Logs:**
```powershell
# Local
npm start

# Docker
docker-compose logs -f bot
```

Expected output:
```
🚀 Starting APOLO Dota 2 Bot...
✅ Connected to PostgreSQL database
📂 Loading 4 command files...
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
✅ Loaded command: remove-apolo-structure
✅ Loaded command: xp-admin
🤖 Bot online as APOLO - Dota2#0567
📊 Serving 1 servers
🎉 Bot fully initialized and ready!
```

### Test Features

1. **Create channels:**
   ```
   /setup-apolo-structure
   ```

2. **Open dashboard:**
   ```
   /dashboard
   ```

3. **Connect Steam:**
   - Click 🔗 Connect button
   - Enter Steam ID
   - Verify profile

4. **Analyze match:**
   - Click 📊 Match button
   - View generated card

### Metrics Endpoint

Check Prometheus metrics (if enabled):

```
http://localhost:9100/metrics
```

---

## Troubleshooting

### Bot Shows Offline

**Check token:**
```powershell
# View .env token (check for spaces)
Get-Content .env | Select-String "DISCORD_TOKEN"
```

**Verify token validity:**
- Go to Discord Developer Portal
- Bot tab → Regenerate token if needed
- Update `.env` with new token
- Restart bot

### Commands Not Appearing

**Solution 1: Re-deploy**
```powershell
npm run deploy
# Wait 5-10 minutes for global propagation
```

**Solution 2: Guild-only deploy (instant)**
```powershell
# Add to .env
DISCORD_GUILD_ID=your_test_server_id

# Deploy
npm run deploy:guilds
```

**Solution 3: Clear Discord cache**
- Close Discord completely
- Delete cache: `%AppData%\Discord\Cache`
- Restart Discord

### Database Connection Error

**PostgreSQL not running:**
```powershell
# Windows
Get-Service -Name postgresql*
Start-Service postgresql-x64-14

# Linux
sudo systemctl start postgresql
```

**Wrong DATABASE_URL:**
```env
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/apolo_dota2

# Docker
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2
```

**Database doesn't exist:**
```powershell
createdb -U postgres apolo_dota2
npm run db:migrate
```

### API Rate Limiting

**Stratz 429 errors:**
- Add multiple tokens:
  ```env
  STRATZ_API_TOKEN_1=token1
  STRATZ_API_TOKEN_2=token2
  ```
- Bot automatically rotates between tokens

**Gemini 429 errors:**
- Same solution with `GEMINI_API_KEY_1..10`

### "Profile is Private" Error

**Fix in Steam settings:**
1. Open Steam profile
2. Edit Profile → Privacy Settings
3. Set "Game details" to **Public**
4. In Dota 2: Settings → Options → Advanced Options
5. Enable "Expose Public Match Data"

### Docker Issues

**Container fails to start:**
```powershell
# Check logs
docker-compose logs bot

# Rebuild
docker-compose up -d --build
```

**Database connection refused:**
```powershell
# Verify postgres container is running
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

**Permission errors (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### TypeScript Errors

```powershell
# Type check
npm run type-check

# Rebuild
npm run build
```

---

## Next Steps

### 1. Create Bot Channels

```
/setup-apolo-structure
```

Creates 8 specialized channels:
- 🏠 connect
- 👤 profile
- ⚔️ reports
- 🧠 ai-analyst
- 📚 meta-builds
- 🎥 content-hub
- 🔎 find-team
- 🏆 server-ranking

### 2. Configure Server

- Set language: Click 🌍 Language in dashboard
- Test features: Click each button in dashboard
- Invite users: Share bot invite link

### 3. Monitor Performance

**Local:**
```
http://localhost:9100/metrics
```

**Docker with Grafana:**
```
http://localhost:3000  (admin/admin)
```

---

## Additional Resources

- [📖 Features Guide](../features/FEATURES.md) - Complete feature list
- [🤖 AI Coach Guide](../features/AI_COACH.md) - AI analysis tools
- [🌍 I18n Guide](../features/I18N.md) - Multi-language system
- [🚀 Scaling Guide](../architecture/SCALING.md) - Infrastructure for 1M+ users
- [📊 Prometheus Guide](../guides/PROMETHEUS.md) - Monitoring setup
- [🚀 VPS Deployment](../deployment/VPS_DEPLOYMENT.md) - Production deployment

---

## Support

Need help?

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Common Issues](https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/issues)
3. Open [GitHub Issue](https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot/issues/new)

---

**Ready to go?** Type `/dashboard` in Discord! 🎮
