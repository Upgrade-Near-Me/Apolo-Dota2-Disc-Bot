# ⚡ Quick Start - Apolo Dota 2 Bot

Get the bot running in 5 minutes with this streamlined guide.

## Prerequisites

Install these first:

- [Node.js v20+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

## Step 1: Discord Bot (2 minutes)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name it "Apolo Dota 2"
3. Go to **"Bot"** tab:
   - Click **"Reset Token"** → Copy and save
   - Enable all 3 intents (Presence, Server Members, Message Content)
4. Go to **"OAuth2"** → **"URL Generator"**:
   - Check: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Embed Links`, `Attach Files`, `Move Members`
   - Copy URL and open in browser → Select your server

**Save:** Token and Application ID (from "General Information" tab)

## Step 2: API Keys (2 minutes)

### Stratz (Required)

1. Visit [stratz.com/api](https://stratz.com/api)
2. Sign up (can use Discord/Steam login)
3. Generate token → Save it

### Gemini AI (Required)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key → Save it

### Steam (Optional)

1. Visit [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Login → Domain: `localhost` → Generate → Save it

## Step 3: Setup (1 minute)

```powershell
# Clone and navigate
git clone <repo-url>
cd "BOT DISC - APOLO DOTA2"

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env
notepad .env
```

Fill in `.env`:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/apolo_dota2
STRATZ_API_TOKEN=your_stratz_token_here
GEMINI_API_KEY=your_gemini_key_here
STEAM_API_KEY=your_steam_key_optional
```

## Step 4: Database (30 seconds)

```powershell
# Create database
createdb -U postgres apolo_dota2

# Run migrations
npm run db:migrate
```

## Step 5: Launch (30 seconds)

```powershell
# Deploy commands to Discord
npm run deploy

# Start bot
npm start
```

## Verify Success

You should see:

```
✅ Loaded command: dashboard
✅ Loaded command: setup-apolo-structure
✅ Connected to PostgreSQL database
🤖 Bot online as ApoloBot#1234
📊 Serving 1 servers
```

## First Test

In Discord:

1. Type `/dashboard` → Interactive panel appears
2. Click **"🔗 Connect"** → Enter Steam ID
3. Click **"📊 Match"** → See your latest match

## Find Your Steam ID

**Method 1:** Direct from URL

- If your profile is `steamcommunity.com/profiles/76561198123456789`
- The number `76561198123456789` is your Steam ID

**Method 2:** Use Tool

- Go to [steamidfinder.com](https://www.steamidfinder.com/)
- Paste your profile URL
- Copy the "steamID64"

## Troubleshooting

### Bot offline?

```powershell
# Check token in .env (no spaces)
Get-Content .env | Select-String "DISCORD_TOKEN"
```

### Commands missing?

```powershell
# Re-deploy
npm run deploy

# Wait 2 minutes or add DISCORD_GUILD_ID to .env for instant deploy
```

### Database error?

```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# If not running
Start-Service postgresql-x64-14

# Re-run migrations
npm run db:migrate
```

### "Profile private" error?

- Open Steam profile settings
- Set "Game details" to **Public**
- Enable "Expose Public Match Data" in Dota 2

## Next Steps

### Create Bot Channels

```
/setup-apolo-structure
```

Creates category with 11 channels:

- 📊 Dashboard
- 🔗 Connect Account
- 📈 Match Analysis
- 👤 Player Profile
- 📉 Progress Tracking
- 🏆 Leaderboards
- 🎯 Meta Heroes
- 🛠️ Item Builds
- ⚖️ Team Balance
- 🤖 AI Coach
- 🌍 Language

### Explore Dashboard

```
/dashboard
```

Use these buttons:

| Button | Function |
|--------|----------|
| 🔗 Connect | Link Steam account |
| 📊 Match | Analyze latest match |
| 👤 Profile | View statistics |
| 📈 Progress | GPM/XPM graphs |
| 🏆 Leaderboard | Server rankings |
| 🎯 Meta | Top heroes |
| 🛠️ Build | Item recommendations |
| ⚖️ Balance | Create teams |
| 🤖 AI Coach | Personalized tips |
| 🌍 Language | EN/PT/ES |

### Change Language

```
/language locale:pt   # Portuguese
/language locale:es   # Spanish
/language locale:en   # English
```

## Docker Alternative (Optional)

If you prefer containers:

```powershell
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec bot npx tsx src/database/migrate.ts

# Deploy commands
docker-compose exec bot npx tsx src/deploy-commands.ts
```

## Documentation

Need more details?

- [📖 Full Setup Guide](SETUP.md) - Detailed instructions
- [🆕 Features Guide](FEATURES.md) - Feature documentation
- [🐳 Docker Guide](DOCKER.md) - Container deployment
- [📝 Project Overview](PROJECT_SUMMARY.md) - Technical details

## Common Questions

**Q: Do I need all 3 API keys?**

A: Discord, Stratz, and Gemini are required. Steam is optional.

**Q: Can I test locally before deploying?**

A: Yes! Use `DISCORD_GUILD_ID` in `.env` for instant test server commands.

**Q: How do I update the bot?**

```powershell
git pull
npm install
npm run db:migrate
docker-compose restart bot  # if using Docker
```

**Q: Can multiple servers use the same bot?**

A: Yes! Each server has independent settings and leaderboards.

**Q: Is this free to run?**

A: Yes! All APIs have generous free tiers sufficient for most servers.

## Support

Issues? Check:

1. [Troubleshooting](#troubleshooting) above
2. [Common Issues](SETUP.md#common-issues) in Setup Guide
3. [GitHub Issues](https://github.com/your-repo/issues)

---

**All set?** Start exploring features with `/dashboard`! 🎮
