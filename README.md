# 🎮 APOLO - Dota 2 Bot

> **Enterprise-grade Discord bot for tactical Dota 2 analysis with multi-language support, advanced statistics, and AI-powered coaching.**

[![Node.js Version](https://img.shields.io/badge/node-20.18.1-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-14.14.1-blue.svg)](https://discord.js.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-14%20%7C%2016-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/docker-compose-blue.svg)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)
[![Deployment](https://img.shields.io/badge/deployment-VPS%20Shared-success.svg)](docs/VPS_SHARED_INTEGRATION_GUIDE.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Overview

**APOLO** is a production-ready, enterprise-grade Discord bot specifically designed for Dota 2 tactical analysis and community management. Built with TypeScript and modern best practices, it provides comprehensive match analysis, AI-powered insights, and team management tools - all delivered directly in Discord with beautiful, professionally designed interfaces.

**Developed by PKT Gamers & Upgrade Near ME** 🎮

## 📊 Current Status

**Version:** 2.2.0 (Production Ready)  
**Release Date:** December 2025  
**Status:** ✅ **DEPLOYED & OPERATIONAL** 🚀

### 🎯 Production Deployment

- 🟢 **VPS:** Live on zapclaudio.com (31.97.103.184)
- 🟢 **Bot:** APOLO - Dota2#0567 ONLINE
- 🟢 **Servers:** 2 active (PKT GAMERS 🇧🇷, DOTA NÚCLEO COMUNIDADE)
- 🟢 **Database:** PostgreSQL 16 connected (10 tables)
- 🟢 **Cache:** Redis 7 operational
- 🟢 **Health:** All systems HEALTHY

**[📊 View Deployment Status](docs/deployment/VPS_DEPLOYMENT_STATUS.md)** | **[🚀 Deployment Guide](docs/deployment/VPS_SHARED_INTEGRATION_GUIDE.md)**

### Tier 1 Features (100% Complete)

**Core Systems:**

- ✅ IMP Score System (-100 to +100 performance rating)
- ✅ Match Awards (10 automated achievement types)
- ✅ XP & Leveling (dynamic progression system)
- ✅ Hero Benchmarks (OpenDota percentile rankings)
- ✅ Ward Heatmap & Vision Score
- ✅ 7 Leaderboard Categories
- ✅ 8 AI Analysis Tools (Google Gemini)
- ✅ Multi-language Support (EN/PT/ES)

**Infrastructure:**

- ✅ Docker Production Deployment (Local + VPS Shared)
- ✅ PostgreSQL 14 (Local) | PostgreSQL 16 (VPS Shared)
- ✅ Redis 7 (Local + VPS Shared with namespace isolation)
- ✅ CI/CD via GitHub Actions (auto-deploy to VPS)
- ✅ Prometheus Metrics + Grafana Dashboards
- ✅ 100+ Tests Passing (Unit + E2E)

**Roadmap:** See [`docs/roadmap/ROADMAP.md`](docs/roadmap/ROADMAP.md)

### ✨ Key Features

- 🌍 **Multi-language i18n System** - English, Portuguese (PT-BR), Spanish with user-aware locale detection
- 🤖 **8 AI Analysis Tools** - Performance, Trends, Weaknesses, Strengths, Hero Pool, Full Report, Compare, Quick Tips
- 📊 **Real-time Match Analysis** - Detailed match cards with performance grades and statistics
- 👤 **Player Profiles** - Complete statistics with visual charts and progression tracking
- 📈 **Progress Tracking** - GPM/XPM evolution graphs with historical data
- 🏆 **Server Leaderboards** - 4 competitive categories: Win Rate, GPM, XPM, Win Streak
- ⚖️ **Smart Team Balancer** - MMR-based automatic team distribution with voice channel integration
- 🎯 **Meta Analysis** - Current meta heroes by position (Carry, Mid, Offlane, Support)
- 🛠️ **Hero Build Guides** - Item builds and skill progression for all heroes
- 🔎 **LFG System** - Looking For Group matchmaking with role and skill filters
- 📹 **Content Hub** - Stream announcements, clips, social links integration
- 🎨 **Professional Dashboard** - Centralized control panel with 8 specialized channels

## 🚀 Quick Start

> **💡 Deployment Options:** APOLO supports two deployment modes:
> - **🏠 Local Development:** Complete Docker Compose stack with PostgreSQL 14 + Redis 7
> - **☁️ VPS Shared Infrastructure:** Production deployment using shared PostgreSQL 16 + Redis 7
> 
> See [VPS Shared Integration Guide](docs/VPS_SHARED_INTEGRATION_GUIDE.md) for production deployment.

### Prerequisites

**Required:**

- **Node.js v20.18.1+** ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop/))
- **Discord Bot Token** ([Create here](https://discord.com/developers/applications))

**Optional (for advanced features):**

- **Stratz API Token** ([Get free token](https://stratz.com/api)) - For enhanced Dota 2 data
- **Steam Web API Key** ([Register](https://steamcommunity.com/dev/apikey)) - For Steam profile integration
- **Google Gemini API Key** ([Get free key](https://aistudio.google.com/app/apikey)) - For AI coaching features

### Installation (Docker - Recommended)

1. **Clone the repository**

   ```powershell
   git clone <repository-url>
   cd "BOT DISC - APOLO DOTA2"
   ```

2. **Configure environment variables**

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

   Edit `.env` with your credentials:

   ```env
   # Discord Configuration
   DISCORD_TOKEN=your_discord_bot_token
   DISCORD_CLIENT_ID=your_application_id
   DISCORD_GUILD_ID=your_test_server_id  # Optional: for instant command deployment

   # Database (auto-configured by Docker)
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/apolo_dota2

   # Redis (auto-configured by Docker)
   REDIS_HOST=redis
   REDIS_PORT=6379

   # API Keys (Optional but recommended)
   # Supports pools up to 10 keys. The bot rotates on 429/403.
   STRATZ_API_TOKEN_1=your_stratz_token           # add STRATZ_API_TOKEN_2..10 as needed
   STEAM_API_KEY=your_steam_key
   GEMINI_API_KEY_1=your_gemini_api_key           # add GEMINI_API_KEY_2..10 as needed
   ```

3. **Start with Docker**

   ```powershell
   # Start all services (PostgreSQL, Redis, Bot)
   docker-compose up -d --build

   # View logs
   docker-compose logs -f bot

   # Run database migrations
   docker-compose exec bot npx tsx src/database/migrate.ts

   # Deploy Discord commands
   docker-compose exec bot npx tsx src/deploy-commands.ts
   ```

4. **Verify bot is online**

   Check Discord - bot should appear online as **APOLO - Dota2**

### Development Setup (Local)

For local development without Docker:

```powershell
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run migrations
npm run db:migrate

# Deploy commands
npm run deploy

# Start bot
npm start

# Or start with auto-reload (development)
npm run dev
```

## 📚 Documentation

### 🚀 Getting Started

- [⚡ Complete Setup Guide](docs/setup/SETUP.md) - Installation, Docker, and Quick Start (all-in-one)

### ✨ Features

- [🎮 Features Overview](docs/features/FEATURES.md) - Complete feature documentation
- [🌍 I18n Guide](docs/features/I18N.md) - Multi-language system with usage patterns
- [🤖 AI Coach](docs/features/AI_COACH.md) - AI analysis tools

### 🏗️ Architecture & Guides

- [📝 Project Summary](docs/architecture/PROJECT_SUMMARY.md) - Technical architecture
- [🚀 Scaling Guide](docs/architecture/SCALING.md) - Infrastructure for 1M+ users
- [✅ Validation Layer](docs/architecture/VALIDATION_LAYER.md) - Input validation system
- [💾 Database Guide](docs/guides/DATABASE.md) - PostgreSQL optimization
- [⚡ Redis Guide](docs/guides/REDIS.md) - Caching strategies
- [📊 Prometheus Metrics](docs/guides/PROMETHEUS.md) - Monitoring & dashboards
- [⏱️ Command Latency](docs/guides/COMMAND_LATENCY.md) - Performance tracking

### 🚢 Deployment

- [✅ Launch Checklist](docs/deployment/LAUNCH_CHECKLIST.md) - Production readiness
- [🖥️ VPS Deployment Guide](docs/deployment/VPS_DEPLOYMENT_GUIDE.md) - Complete server deployment
- [📋 VPS Deployment Checklist](docs/deployment/VPS_DEPLOYMENT_CHECKLIST.md) - Step-by-step validation

### 🗺️ Roadmap

- [📅 Roadmap](docs/roadmap/ROADMAP.md) - 2025 timeline, milestones, and growth strategy

## 🎮 Commands & Features

### Admin Commands (Slash Commands)

| Command | Description | Usage |
|---------|-------------|-------|
| `/dashboard` | Open interactive control panel | `/dashboard` |
| `/setup-apolo-structure` | Create all bot channels and categories | `/setup-apolo-structure` |
| `/remove-apolo-structure` | Remove all bot channels | `/remove-apolo-structure` |
| `/xp-admin` | Grant XP to players (admin only) | `/xp-admin user:@Player amount:500 reason:top_3` |

### Dashboard Channels (8 Specialized Channels)

After running `/setup-apolo-structure`, the bot creates:

1. **🔗・connect** - Steam account connection system
2. **👤・profile** - Player statistics and profiles
3. **📊・reports** - Match analysis and history
4. **🤖・ai-analyst** - 8 AI-powered analysis tools
5. **🎯・meta-builds** - Meta heroes and item builds by position
6. **📹・content-hub** - Stream announcements, clips, social links
7. **🔎・find-team** - LFG (Looking For Group) matchmaking system
8. **🏆・server-ranking** - Competitive leaderboards (4 categories)

### Interactive Features (Button-Based)

Users interact via buttons in each channel:

**Connect Channel:**

- 🔗 Connect Steam - Link your Steam account via OpenDota verification
- 🔓 Disconnect - Unlink Steam account
- ℹ️ Help - Connection instructions

**Profile Channel:**

- 👤 View Profile - Display detailed player statistics
- 📊 Match History - Last 20 matches overview
- 🎮 Hero Pool - Most played heroes with stats
- 📈 Progress - GPM/XPM evolution graphs
- 🏆 Rank Info - MMR and rank details

**Reports Channel:**

- 📊 Last Match - Analyze most recent game
- 📅 Match History - View all recent matches
- 🔎 Search Match - Analyze specific match by ID
- 📈 Trends - Performance trends over time
- 🎯 Best Games - Highlight best performances

**AI-Analyst Channel (8 Analysis Tools):**

- 📊 Performance - Overall gameplay analysis
- 📈 Trends - Identify performance patterns
- ⚠️ Weaknesses - Areas needing improvement
- ✅ Strengths - What you're doing well
- 🦸 Heroes - Best/worst hero performances
- 📄 Full Report - Comprehensive analysis
- ⚖️ Compare - Compare to bracket average
- 💡 Quick Tip - Fast actionable advice

**Meta-Builds Channel:**

- 🛡️ Carry Meta - Top carry heroes with win rates
- ⚔️ Mid Meta - Dominant mid heroes
- 🏃 Offlane Meta - Best offlane picks
- 💊 Support Meta - Support hero rankings
- 🔍 Hero Build - Item/skill builds for any hero

**Content Hub:**

- 🎥 Announce Stream - Share your stream
- 📱 Social Links - Add social media profiles
- 📹 Submit Clip - Share gameplay highlights

**Find Team (LFG):**

- 🛡️ Core Player - Find duo as core role
- 💊 Support Player - Find duo as support
- 👶 Beginner - Match with beginners
- 🔥 Veteran - Match with experienced players
- 🔎 Find Duo - General duo search

**Server Ranking:**

- Auto-updates hourly with top 10 players in:
  - 🎯 Highest Win Rate
  - 💰 Highest GPM Average
  - 📈 Highest XPM Average
  - 🔥 Longest Win Streak

## 🏗️ Architecture

### Tech Stack (Enterprise)

#### Core Technologies

- **Runtime:** Node.js v20.18.1 with ES Modules (TypeScript)
- **Language:** TypeScript 5.9.3 with strict mode enabled
- **Framework:** Discord.js v14 (Button-based interactions)
- **Database:** PostgreSQL 14+ with connection pooling (pg)
- **Cache Layer:** Redis 7+ (ioredis)
- **Image Generation:** @napi-rs/canvas (native bindings)
- **APIs:**
  - Stratz GraphQL (primary Dota 2 data)
  - Steam Web API (hero images, profiles)
  - OpenDota REST (meta statistics, fallback)
  - Google Gemini AI (coaching advice with locale awareness)

#### Development Tools

- **Container:** Docker + Docker Compose (production-ready multi-stage builds)
- **Code Quality:** ESLint + TypeScript strict mode
- **Testing:** Vitest (unit) + E2E test suite
- **Development:** tsx watch (auto-reload during development)
- **Build System:** TypeScript compiler with source maps

### Project Structure

```text
BOT DISC - APOLO DOTA2/
├── src/
│   ├── commands/              # Slash commands (admin)
│   │   ├── dashboard.ts       # Interactive dashboard (1065 lines)
│   │   ├── setup-dashboard.ts # Channel creator (680 lines)
│   │   └── remove-apolo-structure.ts
│   ├── handlers/              # Interaction handlers
│   │   ├── buttonHandler.ts   # All button interactions (1600+ lines)
│   │   └── modalHandler.ts    # Modal submissions
│   ├── services/              # API integration layer
│   │   ├── stratzService.ts   # Stratz GraphQL queries
│   │   ├── openDotaService.ts # OpenDota REST API
│   │   ├── GeminiService.ts   # Google Gemini AI
│   │   └── RedisService.ts    # Redis caching
│   ├── utils/                 # Utility functions
│   │   ├── i18n.ts            # Multi-language system
│   │   ├── imageGenerator.ts  # Match card generation
│   │   ├── chartGenerator.ts  # Progress charts
│   │   ├── interactionGuard.ts # Safe Discord interactions
│   │   ├── dm.ts              # DM messaging utility
│   │   └── menuRefresh.ts     # Channel menu updates
│   ├── database/              # Database layer
│   │   ├── index.ts           # PostgreSQL pool
│   │   └── migrate.ts         # Schema migrations
│   ├── locales/               # Translation files
│   │   ├── en.json            # English
│   │   ├── pt.json            # Portuguese
│   │   └── es.json            # Spanish
│   ├── types/                 # TypeScript definitions
│   │   └── dota.d.ts          # Dota 2 interfaces
│   ├── config/
│   │   └── index.ts           # Environment config
│   ├── index.ts               # Bot entry point (682 lines)
│   ├── deploy-commands.ts     # Global command registration
│   └── deploy-guilds.ts       # Guild-specific deployment
├── tests/
│   ├── unit/                  # Unit tests
│   │   └── teamBalancer.test.ts
│   └── e2e/                   # Integration tests
├── migrations/                # Database migrations
│   └── 002_v2_dashboard_tables.sql
├── docs/                      # Documentation
│   ├── I18N_GUIDE.md
│   ├── REDIS_QUICK_REFERENCE.md
│   ├── TS_MIGRATION_COMPLETE.md
│   └── guides/
│       └── AI_COACH_GUIDE.md
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Multi-stage container build
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Test configuration
└── package.json               # Dependencies & scripts
```

### Command Structure

**Admin Commands (Slash):**

- `/dashboard` - Opens interactive control panel
- `/setup-apolo-structure` - Creates 8 channels (one-time setup)
- `/remove-apolo-structure` - Removes all APOLO channels

**User Interactions (Buttons):**

All user features accessed via channel-specific buttons in 8 specialized channels. See [Commands & Features](#-commands--features) section above for complete list.

## 🗄️ Database Schema

### Tables

**users** - Discord ↔ Steam account linking

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(20) UNIQUE NOT NULL,
  steam_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**guild_settings** - Server preferences

```sql
CREATE TABLE guild_settings (
  guild_id VARCHAR(20) PRIMARY KEY,
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**matches** - Match history cache

```sql
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  match_id BIGINT UNIQUE NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  hero_id INT NOT NULL,
  kills INT,
  deaths INT,
  assists INT,
  gpm INT,
  xpm INT,
  net_worth INT,
  result BOOLEAN,
  played_at TIMESTAMP,
  FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);
```

**server_stats** - Leaderboard data

```sql
CREATE TABLE server_stats (
  id SERIAL PRIMARY KEY,
  guild_id VARCHAR(20) NOT NULL,
  discord_id VARCHAR(20) NOT NULL,
  total_matches INT DEFAULT 0,
  total_wins INT DEFAULT 0,
  total_losses INT DEFAULT 0,
  win_streak INT DEFAULT 0,
  avg_gpm DECIMAL(10,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(guild_id, discord_id)
);
```

## 🌍 Multi-language i18n System

Apolo supports three languages with user-aware automatic translation:

- **🇺🇸 English** (en)
- **🇧🇷 Português** (pt)
- **🇪🇸 Español** (es)

### Locale Detection Priority

1. **Guild setting** (Admin override via language selector in dashboard)
2. **User's Discord client language** (automatic detection from `interaction.locale`)
3. **Fallback** to English

### What Gets Translated

- ✅ All bot responses and error messages
- ✅ Embed titles, descriptions, and footers
- ✅ Button labels and modal inputs
- ✅ Image text (VICTORY/DEFEAT, Duration, etc.)
- ✅ AI Coach responses (locale-aware system prompts)
- ✅ Channel descriptions and messages

### Changing Language

Users can change server language via the dashboard language selector button (shows 3 flag buttons).

Language preference is stored per Discord server in the `guild_settings` table.

## 🎨 Visual Features

### Match Cards

Generated in real-time using @napi-rs/canvas:

- **Dynamic backgrounds** - Green for victory, red for defeat
- **KDA display** - Large, prominent stats
- **Performance grade** - S, A, B, C, D, F based on KDA
- **Match details** - GPM, XPM, Net Worth, Duration
- **Hero portraits** - Fetched from Steam CDN

### Progress Charts

Line charts for stat evolution:

- **GPM/XPM trends** - Last 20 matches
- **Statistical summary** - Average, max, min values
- **Clean design** - Professional gradient backgrounds

### Profile Cards

Comprehensive player statistics:

- **Win rate pie chart** - Visual representation
- **Hero pool** - Top 5 most played heroes
- **Match history** - Total games, W/L ratio
- **MMR display** - Current rank

## ⚡ Performance & Optimization

### Optimization Features

- **Redis caching** - API response cache + session management
- **Connection pooling** - Reusable PostgreSQL connections
- **Image caching** - Reduced API calls to Steam CDN
- **Async operations** - Non-blocking I/O for all API calls
- **Database indexing** - Optimized queries for leaderboards
- **In-memory locale cache** - Fast translation lookups
- **TypeScript compilation** - Pre-compiled for production

### Performance Metrics

- **Response time:** < 2.5 seconds (target)
- **Image generation:** ~100ms per card
- **Database queries:** < 50ms with indexes
- **API latency:** ~300-500ms (Stratz)
- **Memory usage:** ~150MB average

## 🤖 AI Analysis System

Powered by Google Gemini AI with 8 specialized analysis tools:

- **📊 Performance** - Overall gameplay analysis with metrics
- **📈 Trends** - Identify performance patterns over time
- **⚠️ Weaknesses** - Areas needing improvement
- **✅ Strengths** - What you're doing well
- **🦸 Heroes** - Best/worst hero performances
- **📄 Full Report** - Comprehensive analysis
- **⚖️ Compare** - Compare to bracket average
- **💡 Quick Tip** - Fast actionable advice

All AI responses are:

- **Personalized** - Based on your Steam profile
- **Multi-language** - Responds in server's language
- **Context-rich** - Uses recent match history
- **Action-oriented** - Practical gameplay advice

## 🔎 LFG (Looking For Group) System

Matchmaking system for finding teammates:

- **Role-based search** - Core (Carry/Mid/Off) or Support
- **Skill filters** - Beginner (Herald-Archon) or Veteran (Legend-Immortal)
- **Duo queue** - Find duo partner
- **Auto-notifications** - Alert when match found

## 🏆 Leaderboard System

4 competitive ranking categories:

- **🎯 Win Rate** - Highest win percentage (min 20 matches)
- **💰 GPM Average** - Gold Per Minute efficiency
- **📈 XPM Average** - Experience Per Minute
- **🔥 Win Streak** - Current consecutive wins

Auto-updates hourly. Top 10 players displayed per category.

## 🐛 Troubleshooting

### Bot not connecting

**Issue:** Bot shows offline in Discord

**Solutions:**

- Verify `DISCORD_TOKEN` in `.env` is correct
- Check token has no spaces or extra characters
- Ensure bot is invited with correct permissions
- Restart bot after `.env` changes

### Commands not appearing

**Issue:** Slash commands don't show up

**Solutions:**

- Run `npm run deploy` again
- Wait 5-10 minutes for Discord cache
- Use `DISCORD_GUILD_ID` for instant guild-only commands
- Check bot has `applications.commands` scope

### Database connection errors

**Issue:** PostgreSQL connection failed

**Solutions:**

- Verify PostgreSQL service is running
- Check `DATABASE_URL` format is correct
- Test connection: `psql -U postgres -d apolo_dota2`
- Run migrations: `npm run db:migrate`

### API rate limits

**Issue:** Stratz API returns 429 errors

**Solutions:**

- Free tier: 1000 requests/day
- Implement request caching
- Upgrade to paid tier if needed
- Check token is valid at stratz.com/api

### Private profile error

**Issue:** "Profile is private" when analyzing matches

**Solutions:**

- Open Steam profile settings
- Set "Game details" to **Public**
- Enable "Expose Public Match Data" in Dota 2 settings
- Wait 5 minutes for Stratz to update

### Canvas build errors

**Issue:** @napi-rs/canvas fails to install

**Solutions:**

- Use Node.js v20 or higher
- Install Visual C++ Build Tools (Windows)
- Use pre-built binaries (automatic with @napi-rs/canvas)
- Try Docker deployment instead

### Language not changing

**Issue:** Bot still responds in wrong language

**Solutions:**

- Run database migration to create `guild_settings` table
- Restart bot after language change
- Clear cache: restart Docker container
- Verify translation keys exist in `src/utils/i18n.js`

## 🚀 Deployment

### Local Development

```powershell
npm run dev
```

### Docker Production (Recommended)

```powershell
# Start all services (PostgreSQL, Redis, Bot)
docker-compose up -d --build

# View logs
docker-compose logs -f bot

# Run migrations
docker-compose exec bot npx tsx src/database/migrate.ts

# Deploy commands
docker-compose exec bot npx tsx src/deploy-commands.ts
```

### VPS Shared Infrastructure Deployment (Production)

**APOLO is currently deployed and operational on VPS shared infrastructure.**

**Live Status:**
- ✅ Bot: APOLO - Dota2#0567 ONLINE
- ✅ VPS: zapclaudio.com (31.97.103.184)
- ✅ Database: PostgreSQL 16 (shared, isolated database `apolo_dota2`)
- ✅ Cache: Redis 7 (shared, namespace `apolo:*`)
- ✅ Deployment: `/opt/apolo-bot`

**Architecture:**
- ✅ Shared PostgreSQL 16 (separate database: `apolo_dota2`)
- ✅ Shared Redis 7 (namespace isolation: `apolo:*`)
- ✅ Auto-deploy via GitHub Actions on push to `main`
- ✅ Zero interference with other projects (n8n, api-node, etc)

**Complete Guide:** See [VPS Shared Integration Guide](docs/deployment/VPS_SHARED_INTEGRATION_GUIDE.md)  
**Current Status:** See [VPS Deployment Status](docs/deployment/VPS_DEPLOYMENT_STATUS.md)

**Quick Setup:**

1. **Configure GitHub Secrets** (in repository settings)

   ```yaml
   GHCR_TOKEN: <github_personal_access_token>
   VPS_HOST: <your_vps_ip>
   VPS_USER: root
   VPS_SSH_KEY: <private_ssh_key>
   DISCORD_TOKEN: <production_token>
   DISCORD_CLIENT_ID: <client_id>
   # ... other secrets
   ```

2. **Push to main branch** - Deployment happens automatically!

   ```powershell
   git push origin main
   # GitHub Actions builds and deploys to VPS
   ```

3. **Monitor deployment**

   Check GitHub Actions tab for deployment status and logs.

**Complete Guide:** See [VPS Shared Integration Guide](docs/VPS_SHARED_INTEGRATION_GUIDE.md)

**Benefits:**
- 💰 Lower resource usage (shared PostgreSQL/Redis)
- 🔐 Enhanced security (databases not publicly exposed)
- 📈 Easier scaling (centralized infrastructure)
- 🔄 Automatic backups (daily at 3AM)
- 🚀 Zero-downtime deployments

---

### Railway Deployment

1. **Install Railway CLI**

   ```powershell
   npm i -g @railway/cli
   ```

2. **Login and initialize**

   ```powershell
   railway login
   railway init
   ```

3. **Add PostgreSQL service**

   ```powershell
   railway add postgres
   ```

4. **Set environment variables in Railway dashboard**

5. **Deploy**

   ```powershell
   railway up
   ```

### Environment Variables (Production)

Set these in your hosting platform:

```env
DISCORD_TOKEN=<production_token>
DISCORD_CLIENT_ID=<client_id>
DATABASE_URL=<provided_by_railway>
REDIS_HOST=<redis_host>
REDIS_PORT=6379
STRATZ_API_TOKEN_1=<your_token>    # add STRATZ_API_TOKEN_2..10 as needed
STEAM_API_KEY=<your_key>
GEMINI_API_KEY_1=<your_key>        # add GEMINI_API_KEY_2..10 as needed
```

## 📊 Monitoring

### Health Checks

The bot logs key events:

```text
🚀 Starting APOLO Dota 2 Bot...
✅ Connected to PostgreSQL database
📂 Loading 3 command files...
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
✅ Loaded command: remove-apolo-structure
🤖 Bot online as APOLO - Dota2#0567
📊 Serving 2 servers
🌍 Loading guild language preferences...
✅ Loaded 2 guild locale preferences
🎉 Bot fully initialized and ready!
```

### Error Tracking

Monitor these logs:

- **Database errors** - Connection issues, query failures
- **API errors** - Rate limits, invalid tokens
- **Discord errors** - Permission issues, interaction timeouts

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Use TypeScript with strict mode
- Add type definitions for new features
- Test with Docker before submitting
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Stratz API Documentation](https://docs.stratz.com/)
- [Steam Web API Reference](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [Google Gemini API](https://ai.google.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 💬 Support

- Open an issue for bug reports
- Check [FEATURES.md](FEATURES.md) for detailed guides
- Read [SETUP.md](SETUP.md) for installation help
- See [DOCKER.md](DOCKER.md) for container deployment

---

Made with ❤️ for the Dota 2 community

**Developed by PKT Gamers & Upgrade Near ME** 🎮
