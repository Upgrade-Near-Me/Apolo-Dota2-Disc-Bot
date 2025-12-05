# 🚀 Setup Guide - Apolo Dota 2 Bot

Complete installation guide for deploying the Apolo Dota 2 Bot on your Discord server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Discord Bot Setup](#discord-bot-setup)
- [API Keys](#api-keys)
- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [Installation Steps](#installation-steps)
- [Verification](#verification)
- [Common Issues](#common-issues)

## Prerequisites

Before starting, ensure you have:

- **Node.js v20+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Discord Account** - [Sign up](https://discord.com/)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js | v20.0.0 | v20.11+ |
| PostgreSQL | 14.0 | 16.0+ |
| RAM | 512MB | 1GB+ |
| Storage | 200MB | 500MB+ |

## Discord Bot Setup

### 1. Create Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter a name (e.g., "Apolo Dota 2")
4. Click **"Create"**

### 2. Configure Bot

1. Navigate to **"Bot"** tab on the left
2. Click **"Reset Token"** and copy the token
3. **Save this token** - you'll need it for `.env`

### 3. Enable Intents

Still in the **"Bot"** tab:

- ✅ Enable **"Presence Intent"**
- ✅ Enable **"Server Members Intent"**
- ✅ Enable **"Message Content Intent"**

### 4. Set Bot Permissions

Navigate to **"OAuth2"** → **"URL Generator"**:

**Scopes:**

- ✅ `bot`
- ✅ `applications.commands`

**Bot Permissions:**

- ✅ `Read Messages/View Channels`
- ✅ `Send Messages`
- ✅ `Embed Links`
- ✅ `Attach Files`
- ✅ `Use Slash Commands`
- ✅ `Connect` (for voice)
- ✅ `Move Members` (for team balancer)

Copy the generated URL at the bottom.

### 5. Invite Bot to Server

1. Open the copied URL in your browser
2. Select your Discord server
3. Click **"Authorize"**
4. Complete the captcha

## API Keys

### Stratz API Token

1. Visit [Stratz API](https://stratz.com/api)
2. Click **"Sign Up"** (can use Discord/Steam login)
3. After login, go to **"API"** section
4. Click **"Generate Token"**
5. Copy and save the token

**Free Tier Limits:**

- 1,000 requests per day
- GraphQL API access
- Real-time match data

### Steam Web API Key (Optional)

1. Go to [Steam API Key Registration](https://steamcommunity.com/dev/apikey)
2. Login with Steam account
3. Enter domain name: `localhost` (for testing)
4. Accept terms and generate key

**Note:** Optional for basic features, required for advanced stats.

### Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login with Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"**
5. Copy the generated key

**Free Tier Limits:**

- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per month

## Database Configuration

### Install PostgreSQL

**Windows:**

```powershell
# Via Chocolatey
choco install postgresql

# Or download installer
# https://www.postgresql.org/download/windows/
```

**Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**

```bash
brew install postgresql@14
brew services start postgresql@14
```

### Create Database

```powershell
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE apolo_dota2;

# Exit
\q
```

### Verify Connection

```powershell
psql -U postgres -d apolo_dota2 -c "SELECT version();"
```

## Environment Variables

### 1. Copy Template

```powershell
Copy-Item .env.example .env
```

### 2. Edit Configuration

Open `.env` in your text editor:

```powershell
notepad .env
```

### 3. Fill Values

```env
# ==========================================
# DISCORD CONFIGURATION
# ==========================================

# Bot token from Discord Developer Portal → Bot → Token
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GaBcDe.fGhIjKlMnOpQrStUvWxYz

# Application ID from Discord Developer Portal → General Information
DISCORD_CLIENT_ID=1234567890123456789

# (Optional) Your test server ID for instant command deployment
# Right-click server → Copy Server ID (enable Developer Mode first)
DISCORD_GUILD_ID=9876543210987654321

# ==========================================
# DATABASE CONFIGURATION
# ==========================================

# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/apolo_dota2

# ==========================================
# API KEYS
# ==========================================

# Stratz API token from https://stratz.com/api
STRATZ_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# (Optional) Steam Web API key from https://steamcommunity.com/dev/apikey
STEAM_API_KEY=ABCDEF1234567890ABCDEF1234567890

# Google Gemini API key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyABCDEF1234567890abcdefGHIJKLMNOPQR
```

### Configuration Tips

**Finding Discord IDs:**

1. Enable **Developer Mode**: User Settings → Advanced → Developer Mode
2. Right-click server/channel/user → **Copy ID**

**Securing Credentials:**

- Never commit `.env` to Git (already in `.gitignore`)
- Use different tokens for development and production
- Rotate tokens if accidentally exposed

## Installation Steps

### 1. Clone Repository

```powershell
git clone <repository-url>
cd "BOT DISC - APOLO DOTA2"
```

### 2. Install Dependencies

```powershell
npm install
```

This installs:

- Discord.js v14
- PostgreSQL client
- Canvas for image generation
- GraphQL client for Stratz
- Gemini AI SDK

### 3. Run Database Migrations

```powershell
npm run db:migrate
```

This creates:

- `users` table - Discord ↔ Steam linking
- `guild_settings` table - Server language preferences
- `matches` table - Match history cache
- `server_stats` table - Leaderboard data

### 4. Deploy Commands

```powershell
npm run deploy
```

Registers slash commands:

- `/dashboard` - Interactive control panel
- `/setup-apolo-structure` - Create bot channels
- `/language` - Change server language

**Note:** If using `DISCORD_GUILD_ID`, commands appear instantly. Otherwise, wait 5-10 minutes for global deployment.

### 5. Start Bot

**Production:**

```powershell
npm start
```

**Development (auto-reload):**

```powershell
npm run dev
```

## Verification

### Success Indicators

You should see this output:

```
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
✅ Loaded command: balance
✅ Loaded command: language
✅ Loaded command: ai-coach
✅ Connected to PostgreSQL database
🤖 Bot online as ApoloBot#1234
📊 Serving 1 servers
```

### Test Commands

In Discord, verify these work:

1. **`/dashboard`** - Opens interactive panel

   - Should display 12 buttons
   - Language selector should show 3 options

2. **`/setup-apolo-structure`** - Creates channels

   - Confirms with buttons
   - Creates category "🎮 APOLO DOTA2"
   - Creates 11 channels

3. **Check bot status** - Should show online in member list

## Common Issues

### Bot Not Connecting

**Problem:** Bot shows offline

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Invalid token | Check `DISCORD_TOKEN` in `.env` has no spaces |
| Wrong token format | Token should start with `MTIx...` or similar |
| Missing intents | Enable all 3 intents in Discord Developer Portal |
| Token expired | Regenerate token in Developer Portal |

**Verification:**

```powershell
# Check .env syntax
Get-Content .env | Select-String "DISCORD_TOKEN"

# Should show: DISCORD_TOKEN=MTIx... (no spaces)
```

### Commands Not Appearing

**Problem:** Slash commands don't show in Discord

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Commands not deployed | Run `npm run deploy` |
| Global deploy delay | Wait 5-10 minutes OR use `DISCORD_GUILD_ID` |
| Missing scope | Bot URL must include `applications.commands` |
| Cache issue | Restart Discord client |

**Quick Fix:**

```powershell
# Re-deploy commands
npm run deploy

# Or for instant test server deployment
# Add DISCORD_GUILD_ID to .env first
```

### Database Connection Failed

**Problem:** `Error: connect ECONNREFUSED`

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| PostgreSQL not running | Start service: `Start-Service postgresql-x64-14` |
| Wrong credentials | Check username/password in `DATABASE_URL` |
| Database doesn't exist | Run `createdb apolo_dota2` |
| Port conflict | Check if port 5432 is available |

**Verification:**

```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Test connection
psql -U postgres -d apolo_dota2 -c "\dt"

# Should list all tables
```

### Migration Errors

**Problem:** `Error running migrations`

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Database doesn't exist | Create with `createdb apolo_dota2` |
| Permissions denied | Check user has CREATE privileges |
| Tables already exist | Safe to ignore if all tables present |
| Syntax errors | Update to latest version from repo |

**Re-run Migrations:**

```powershell
# Drop existing tables (WARNING: deletes data)
psql -U postgres -d apolo_dota2 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations again
npm run db:migrate
```

### API Errors

**Problem:** Stratz/Steam API returns errors

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid token | Regenerate token at stratz.com/api |
| 429 Too Many Requests | Rate limit exceeded | Wait or upgrade plan |
| 404 Not Found | Private profile | Make Steam profile public |
| 500 Server Error | API downtime | Check status at status.stratz.com |

**Verify API Keys:**

```powershell
# Test Stratz connection
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.stratz.com/graphql

# Should return GraphQL schema
```

### Canvas Installation Issues

**Problem:** `@napi-rs/canvas` fails to build

**Solution (Windows):**

1. Install Visual C++ Build Tools:

   ```powershell
   choco install visualstudio2019buildtools
   ```

2. Or use pre-built binaries (automatic with `@napi-rs/canvas`)

**Alternative:** Use Docker deployment (see [DOCKER.md](DOCKER.md))

### Permission Errors

**Problem:** Bot can't move members or create channels

**Solutions:**

1. **Check role hierarchy:**

   - Bot's role must be **above** user roles
   - Server Settings → Roles → Drag bot role up

2. **Verify permissions:**

   - Right-click bot → Manage → Permissions
   - Ensure "Move Members" is enabled

3. **Re-invite bot:**

   - Generate new OAuth2 URL with correct permissions
   - Kick old bot and invite with new URL

## Next Steps

After successful setup:

1. **Create channels:**

   ```
   /setup-apolo-structure
   ```

2. **Test dashboard:**

   ```
   /dashboard
   ```

3. **Link Steam account:**

   - Click "🔗 Connect" button
   - Enter Steam ID in modal

4. **Explore features:**

   - Match analysis
   - Player profiles
   - Leaderboards
   - AI Coach

5. **Configure language:**

   ```
   /language locale:pt
   ```

6. **Invite members** and start competing!

## Additional Resources

- [Quick Start Guide](QUICKSTART.md) - 5-minute setup
- [Features Documentation](FEATURES.md) - Detailed feature guide
- [Docker Guide](DOCKER.md) - Container deployment
- [Discord.js Guide](https://discordjs.guide/) - Framework documentation
- [Stratz API Docs](https://docs.stratz.com/) - API reference

## Support

Having issues? Try:

1. Check [Common Issues](#common-issues) section above
2. Review [Troubleshooting](README.md#troubleshooting) in main README
3. Search existing GitHub issues
4. Open a new issue with logs and error messages

---

**Ready to Deploy?** Continue to [QUICKSTART.md](QUICKSTART.md) for rapid setup!
