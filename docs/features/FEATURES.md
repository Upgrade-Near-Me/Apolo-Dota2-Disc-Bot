# 🆕 Features Guide - APOLO Dota 2 Bot

Comprehensive guide to all features in Apolo Dota 2 Bot (v2.2 - Tier 1 Gamification Complete).

## Table of Contents

- [🎮 Tier 1 Features (NEW - Phase 13)](#-tier-1-features-new---phase-13)
  - [IMP Score System](#imp-score-system)
  - [Match Awards](#match-awards)
  - [XP & Leveling](#xp--leveling)
  - [Hero Benchmarks](#hero-benchmarks)
  - [Admin XP Command](#admin-xp-command)
- [8 Specialized Channels](#8-specialized-channels)
- [Team Balancer](#team-balancer)
- [AI Analysis System](#ai-analysis-system)
- [Multi-language System](#multi-language-system)
- [LFG System](#lfg-system)
- [Content Hub](#content-hub)
- [Database Schema](#database-schema)
- [Setup Requirements](#setup-requirements)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## 🎮 Tier 1 Features (NEW - Phase 13)

**Phase 13 Complete (100%)** - Enterprise-grade gamification system deployed across 4 features:

### IMP Score System

**Overview:** Impact Score (-100 to +100) quantifies match performance with unique BR formula

**Algorithm:**

- **KDA Component** (max ±40): Kills vs Deaths (normalized)
- **Economy Component** (max ±30): GPM efficiency vs bracket average
- **Impact Component** (max ±20): Assists + building contribution
- **Win Bonus**: ±10 for victory/defeat
- **Result:** -100 (terrible) to +100 (perfect game)

**In Profiles:** Shows avg IMP across last 50 matches (at `/dashboard → Profile`)

**Database:** `match_imp_scores` table (match_id, steam_id, imp_score, created_at)

**Example:**

```text
Match Result: WIN (5/2/8, 420 GPM, 35min)
IMP Calculation:
  KDA: +28 (positive K/D ratio)
  Economy: +18 (above bracket avg)
  Impact: +14 (high assist count)
  Win Bonus: +10
  TOTAL: +70 IMP
```

### Match Awards

**Overview:** 10 achievement types auto-detected and awarded after each match analysis

**Award Types:**

1. 🔥 **Godlike Streak** - 5+ consecutive kills without death
2. 💰 **Flash Farmer** - 600+ GPM (top 5% economy)
3. 🛡️ **Unkillable** - 0 deaths entire game
4. 🎯 **Precision Striker** - 70%+ kill participation
5. 🏆 **Performance Peak** - IMP Score ≥ +60
6. 🤝 **Team Player** - 15+ assists in one match
7. 💪 **Carry Dominance** - Outfarm enemy carry by 50%+ GPM
8. 🎪 **Rampage Master** - 5+ man teamfight kills
9. ⭐ **Rising Star** - 3 awards in last 5 matches
10. 🔐 **Lockdown** - 20+ stuns/silences in game

**In Profiles:** Shows recent awards (last 5) + total award count

**Database:** `match_awards` table (match_id, steam_id, award_type, created_at)

**Notifications:** Award emoji + name in match analysis embed

### XP & Leveling

**Overview:** Progressive leveling system with dynamic curve and role-based rewards

**XP Sources:**

- **Match Played** - 100 XP base + IMP bonus (0-50 XP)
- **Message Sent** - 5 XP per message (max 50/day)
- **Voice Time** - 10 XP per minute (max 300/day)
- **Awards Earned** - 25 XP per award (auto-applied)
- **Admin Grant** - Manual XP via `/xp-admin` command

**Level Formula:** `XP = n² × 100` (n = current level)

**Level Progression:**

```text
Level 1:  0 → 100 XP
Level 2:  100 → 500 XP (need 400)
Level 3:  500 → 1,100 XP (need 600)
Level 5:  2,500 → 3,900 XP (need 1,400)
Level 10: 10,000 → 12,100 XP (need 2,000)
```

**In Profiles:** Shows current level + XP progress bar, next level requirements

**Database:** 
- `user_xp` table (user_id, current_xp, current_level, total_earned)
- `xp_events` table (user_id, event_type, amount, source, created_at)

**Admin Command:** `/xp-admin user:@Player reason:top_3_leaderboard amount:500`

### Hero Benchmarks

**Overview:** OpenDota percentile ranking showing how you compare to bracket

**Display Format:**
```
📊 Invoker Benchmarks

Your Stats (Immortal)
  GPM: 385 → Top 12% ⭐
  XPM: 520 → Top 8% ⭐⭐
  Win Rate: 58% → Top 5% ⭐⭐⭐

Bracket Average (Immortal)
  GPM: 340, XPM: 480, WR: 52%
```

**Percentile Ranking:**
- Top 1% - ⭐⭐⭐⭐⭐ (Legendary)
- Top 5% - ⭐⭐⭐⭐ (Elite)
- Top 10% - ⭐⭐⭐ (Expert)
- Top 25% - ⭐⭐ (Advanced)
- Top 50% - ⭐ (Competent)
- Below 50% - (Standard)

**Caching:** Redis cache 5 minutes per hero (TTL=300s)

**Source:** OpenDota `/heroStats` API (fallback if Stratz unavailable)

**Database:** Cached in Redis, not persisted in PostgreSQL

### Admin XP Command

**Command:** `/xp-admin user:@Player amount:500 reason:top_3_leaderboard`

**Permissions:** Requires `MANAGE_GUILD` (admin only)

**Parameters:**
- `user` - Discord user to grant XP to
- `amount` - XP amount (1-10,000)
- `reason` - Admin note (for logging)

**Response Example:**
```
✅ XP Granted

Player: @User#1234
Amount: 500 XP
Reason: top_3_leaderboard
New Level: 15 (2,340/2,600 XP)
```

**i18n Support:** Full localization en/pt/es

---

## 8 Specialized Channels

After running `/setup-apolo-structure`, the bot creates 8 interactive channels:

### 1. 🔗・connect (Steam Account Connection)

**Features:**
- Link Steam account via OpenDota verification
- Modal input for Steam ID/URL
- Automatic profile verification
- Disconnect option

**Buttons:**
- 🔗 Connect Steam - Opens modal for Steam ID
- 🔓 Disconnect - Unlink account
- ℹ️ Help - Connection instructions

### 2. 👤・profile (Player Statistics)

**Features:**
- Detailed player statistics
- Hero pool analysis
- Match history overview
- Progress tracking

**Buttons:**
- 👤 View Profile - Display player stats
- 📊 Match History - Last 20 matches
- 🎮 Hero Pool - Most played heroes
- 📈 Progress - GPM/XPM graphs
- 🏆 Rank Info - MMR details

### 3. 📊・reports (Match Analysis)

**Features:**
- Latest match analysis
- Match search by ID
- Performance trends
- Best games highlights

**Buttons:**
- 📊 Last Match - Analyze recent game
- 📅 Match History - View all matches
- 🔎 Search Match - Analyze specific match
- 📈 Trends - Performance patterns
- 🎯 Best Games - Top performances

### 4. 🤖・ai-analyst (8 AI Analysis Tools)

**Features:**
- Powered by Google Gemini AI
- Personalized gameplay insights
- Multi-language responses
- Context-rich analysis

**8 Analysis Tools:**
- 📊 Performance - Overall gameplay analysis
- 📈 Trends - Performance patterns over time
- ⚠️ Weaknesses - Areas needing improvement
- ✅ Strengths - What you're doing well
- 🦸 Heroes - Best/worst hero performances
- 📄 Full Report - Comprehensive analysis
- ⚖️ Compare - Compare to bracket average
- 💡 Quick Tip - Fast actionable advice

### 5. 🎯・meta-builds (Meta & Builds)

**Features:**
- Current meta heroes by position
- Win rates and pick rates
- Item builds and skill progression
- Position-based organization

**Buttons:**
- 🛡️ Carry Meta - Top carry heroes
- ⚔️ Mid Meta - Dominant mid heroes
- 🏃 Offlane Meta - Best offlane picks
- 💊 Support Meta - Support rankings
- 🔍 Hero Build - Detailed builds

### 6. 📹・content-hub (Community Content)

**Features:**
- Stream announcements
- Social media integration
- Gameplay clips sharing
- Creator promotion

**Buttons:**
- 🎥 Announce Stream - Share your stream
- 📱 Social Links - Add social profiles
- 📹 Submit Clip - Share highlights

### 7. 🔎・find-team (LFG System)

**Features:**
- Role-based matchmaking
- Skill level filters
- Duo queue search
- Auto-notifications

**Buttons:**
- 🛡️ Core Player - Find duo as core
- 💊 Support Player - Find duo as support
- 👶 Beginner - Herald to Archon
- 🔥 Veteran - Legend to Immortal
- 🔎 Find Duo - General search

### 8. 🏆・server-ranking (Leaderboards)

**Features:**
- 4 competitive categories
- Auto-updates hourly
- Top 10 players per category
- Real-time statistics

**Categories:**
- 🎯 Highest Win Rate (min 20 matches)
- 💰 Highest GPM Average
- 📈 Highest XPM Average
- 🔥 Longest Win Streak

## Team Balancer

Automatic MMR-based team balancing with voice channel integration.

### Overview

The `/balance` command (accessible via dashboard) automatically creates balanced Dota 2 teams by:

1. Fetching MMR data from Stratz API for linked accounts
2. Sorting players by skill level (highest to lowest)
3. Distributing players using snake draft algorithm
4. Moving players to designated voice channels

### How It Works

#### Algorithm

**Snake Draft Distribution:**

```
Players sorted by MMR: [6000, 5500, 5000, 4500, 4000, 3500]

Team 1: 6000, 5000, 4000  (Avg: 5000)
Team 2: 5500, 4500, 3500  (Avg: 4500)
```

**Process:**

1. Player 1 (highest) → Team 1
2. Player 2 → Team 2
3. Player 3 → Team 2
4. Player 4 → Team 1
5. Continues alternating

**Unlinked Players:**

- Players without Steam accounts are distributed randomly
- Shown as "No MMR" in results

### Usage

#### Via Dashboard (Recommended)

1. Join a voice channel
2. Type `/dashboard`
3. Click **"⚖️ Balance"** button
4. Select team channels via dropdown menus
5. Confirm

#### Direct Command (Admin)

```
/balance team1_channel:#radiant team2_channel:#dire
```

### Requirements

**Bot Permissions:**

- ✅ `Move Members` - Required to move users between channels
- ✅ `Connect` - Join voice channels
- ✅ `View Channels` - See voice channel members

**User Requirements:**

- Must be in a voice channel
- At least 2 players needed
- Linked Steam accounts recommended (not required)

**Channel Setup:**

- Create two voice channels (e.g., "Radiant", "Dire")
- Ensure bot has permissions in both channels

### Output Example

```
⚖️ Teams Balanced Successfully!

🌟 Team 1 - RADIANT
1. Player1 (6000 MMR)
2. Player3 (5000 MMR)
3. Player5 (4000 MMR)

🔥 Team 2 - DIRE
1. Player2 (5500 MMR)
2. Player4 (4500 MMR)
3. Player6 (3500 MMR)

📊 Team Statistics
Team 1: Avg MMR: 5000
Team 2: Avg MMR: 4500
Difference: 500 MMR
```

### Advanced Features

**Minimum Difference:**

- Algorithm minimizes MMR gap between teams
- Typically within 200-500 MMR

**Mixed Skill Levels:**

- Works with any player count (2-10+)
- Handles unranked players gracefully

**Multiple Uses:**

- Can re-balance with different players
- Swap teams option (future feature)

## Multi-language System

Full internationalization support for three languages.

### Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English | `en` | 🇺🇸 | ✅ Complete |
| Português | `pt` | 🇧🇷 | ✅ Complete |
| Español | `es` | 🇪🇸 | ✅ Complete |

### Changing Language

#### Via Dashboard

1. Type `/dashboard`
2. Click **"🌍 Language"** button
3. Select language from 3 buttons:
   - 🇺🇸 English
   - 🇧🇷 Português
   - 🇪🇸 Español

#### Via Command (Admin)

```
/language locale:pt   # Portuguese
/language locale:en   # English
/language locale:es   # Spanish
```

### What Gets Translated

**All Bot Responses:**

- ✅ Command descriptions
- ✅ Error messages
- ✅ Success confirmations
- ✅ Embed titles and descriptions
- ✅ Button labels
- ✅ Modal input labels
- ✅ Image text (VICTORY/DEFEAT, Duration)

**Not Translated:**

- ❌ Slash command names (remain in English)
- ❌ User-generated content
- ❌ Hero/item names (use official translations)

### Translation Examples

#### Match Analysis

| Element | English | Português | Español |
|---------|---------|-----------|---------|
| Victory | VICTORY | VITÓRIA | VICTORIA |
| Defeat | DEFEAT | DERROTA | DERROTA |
| Duration | Duration | Duração | Duración |
| Performance | Performance | Desempenho | Rendimiento |

#### Dashboard Buttons

| Button | English | Português | Español |
|--------|---------|-----------|---------|
| Connect | 🔗 Connect | 🔗 Conectar | 🔗 Conectar |
| Match | 📊 Match | 📊 Partida | 📊 Partida |
| Profile | 👤 Profile | 👤 Perfil | 👤 Perfil |
| Balance | ⚖️ Balance | ⚖️ Balancear | ⚖️ Balancear |

#### Error Messages

| Error | English | Português | Español |
|-------|---------|-----------|---------|
| No account | No Steam account linked | Nenhuma conta Steam vinculada | No hay cuenta Steam vinculada |
| Private profile | Profile is private | Perfil é privado | El perfil es privado |
| No matches | No matches found | Nenhuma partida encontrada | No se encontraron partidas |

### Implementation Details

#### Storage

**Database Table:**

```sql
CREATE TABLE guild_settings (
  guild_id VARCHAR(20) PRIMARY KEY,
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Per-Server Settings:**

- Each Discord server has independent language preference
- Stored in PostgreSQL for persistence
- Cached in memory for performance

#### Translation Function

**Usage in Code:**

```javascript
import { t } from './utils/i18n.js';

// Translate text
const message = t(guildId, 'match_victory');

// With variables
const greeting = t(guildId, 'welcome_user', { username: 'Player1' });
```

**Translation Keys:**

Located in `src/utils/i18n.js`:

```javascript
translations = {
  en: {
    match_victory: 'VICTORY',
    match_defeat: 'DEFEAT',
    dashboard_title: 'Apolo Dashboard'
  },
  pt: {
    match_victory: 'VITÓRIA',
    match_defeat: 'DERROTA',
    dashboard_title: 'Painel Apolo'
  },
  es: {
    match_victory: 'VICTORIA',
    match_defeat: 'DERROTA',
    dashboard_title: 'Panel Apolo'
  }
}
```

#### Fallback System

**Default Language:** English

**Missing Keys:**

- If translation missing → falls back to English
- Logs warning for developers
- Prevents errors for users

### Adding New Languages

**Steps:**

1. Edit `src/utils/i18n.js`
2. Add new language object:

   ```javascript
   fr: {
     match_victory: 'VICTOIRE',
     match_defeat: 'DÉFAITE',
     // ... all keys
   }
   ```

3. Update language command choices
4. Run migrations (adds to database)
5. Restart bot

**Translation Requirements:**

- Translate all 417+ keys
- Maintain consistent tone
- Test all features
- Consider character limits (Discord embeds)

## Database Schema

New tables added for features.

### guild_settings Table

Stores server-specific preferences.

```sql
CREATE TABLE guild_settings (
  guild_id VARCHAR(20) PRIMARY KEY,
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `guild_id` | VARCHAR(20) | Discord server ID (primary key) |
| `locale` | VARCHAR(5) | Language code (en/pt/es) |
| `created_at` | TIMESTAMP | When settings were created |
| `updated_at` | TIMESTAMP | Last modification time |

**Indexes:**

- Primary key on `guild_id` for fast lookups

**Usage:**

```javascript
// Get server language
const locale = await getGuildLocale(guildId);

// Set server language
await setGuildLocale(guildId, 'pt');
```

## Setup Requirements

### Bot Permissions Update

**Required Permissions:**

Add these in Discord Developer Portal:

| Permission | Reason | Category |
|------------|--------|----------|
| Move Members | Team balancer functionality | Voice |
| Connect | Join voice channels | Voice |
| View Channels | See voice members | General |

**Update Bot Invite:**

1. Go to OAuth2 → URL Generator
2. Add new permissions
3. Generate new URL
4. Re-invite bot (or update role)

### Database Migration

**Run Migration:**

```powershell
npm run db:migrate
```

**What It Creates:**

- `guild_settings` table for language storage
- Default 'en' locale for existing servers

**Verification:**

```powershell
psql -U postgres -d apolo_dota2 -c "\d guild_settings"
```

### Environment Variables

**No New Variables Required!**

All features work with existing setup:

```env
DISCORD_TOKEN=...
STRATZ_API_TOKEN=...
DATABASE_URL=...
```

## Performance

### Impact Analysis

**Memory Usage:**

- Translation cache: ~5MB
- Guild settings cache: < 1MB
- Total overhead: ~6MB

**Response Time:**

| Feature | Before | After | Increase |
|---------|--------|-------|----------|
| Dashboard | 300ms | 320ms | +20ms |
| Match | 1200ms | 1220ms | +20ms |
| Balance | N/A | 2500ms | New |

**Database Queries:**

- Language lookup: < 5ms (cached)
- Settings update: < 10ms
- Negligible impact on performance

**API Calls:**

- MMR fetching: 200ms per player
- 10 players: ~2 seconds total
- Within target response time

### Optimization Features

**Caching:**

- Guild locale cached in memory
- Translation strings pre-loaded
- Reduces database queries

**Async Operations:**

- MMR fetching in parallel
- Non-blocking I/O
- Efficient resource usage

**Connection Pooling:**

- Reusable database connections
- No connection overhead per query

## Future Roadmap

### Planned Features

**Phase 1: Enhanced Balancing**

- [ ] Captain mode (captains pick players)
- [ ] Custom MMR offsets for balancing
- [ ] Save team compositions
- [ ] Rematch option (swap teams)
- [ ] Support 1v1, 3v3, 5v5 formats

**Phase 2: Language Expansion**

- [ ] Auto-detect from Discord locale
- [ ] Add French, German, Russian
- [ ] Community translation contributions
- [ ] Per-user language preference

**Phase 3: Advanced Stats**

- [ ] Team synergy analysis
- [ ] Role-based balancing
- [ ] Hero pool considerations
- [ ] Historical team performance

**Phase 4: Integration**

- [ ] Voice chat integration
- [ ] Automated tournament brackets
- [ ] Stat tracking across sessions
- [ ] Discord activity status

## Troubleshooting

### Team Balancer Issues

#### Bot Can't Move Members

**Problem:** "Missing permissions" error

**Solutions:**

1. **Check bot role hierarchy:**

   - Server Settings → Roles
   - Drag bot role **above** user roles

2. **Verify permissions:**

   - Right-click bot → Edit
   - Ensure "Move Members" enabled

3. **Check channel permissions:**

   - Edit voice channel
   - Verify bot can "Connect" and "Move Members"

4. **Re-invite bot:**

   - Generate new OAuth2 URL with correct permissions
   - Use new URL to update bot

#### No MMR Data

**Problem:** Players show "No MMR"

**Solutions:**

1. **Link Steam accounts:**

   ```
   /dashboard → 🔗 Connect
   ```

2. **Ensure profiles public:**

   - Steam Settings → Privacy
   - Set profile to "Public"

3. **Wait for Stratz update:**

   - May take 5-10 minutes for new data

4. **Verify Stratz API:**

   - Check token is valid
   - Test with working player

#### Players Not Moving

**Problem:** Players stay in original channel

**Solutions:**

1. **Check user permissions:**

   - Users might have restricted movement

2. **Verify target channels:**

   - Channels must exist
   - Bot must have access

3. **Test manually:**

   - Try moving one user manually
   - Confirms permission setup

### Language Issues

#### Language Not Changing

**Problem:** Bot still responds in old language

**Solutions:**

1. **Run migration:**

   ```powershell
   npm run db:migrate
   ```

2. **Restart bot:**

   ```powershell
   docker-compose restart bot
   # or
   npm start
   ```

3. **Clear cache:**

   - Restart process clears memory cache
   - Should reflect new language

4. **Verify database:**

   ```powershell
   psql -U postgres -d apolo_dota2 -c "SELECT * FROM guild_settings;"
   ```

#### Missing Translations

**Problem:** Some text still in English

**Solutions:**

1. **Check translation keys:**

   - Open `src/utils/i18n.js`
   - Verify key exists for all languages

2. **Update code:**

   - Ensure code uses `t()` function
   - Not hardcoded strings

3. **Report issue:**

   - Open GitHub issue
   - Include screenshot and language

#### Images Show Wrong Language

**Problem:** Match cards display wrong language

**Solutions:**

1. **Regenerate images:**

   - Language change applies to new images
   - Old images cached

2. **Clear image cache:**

   - Restart bot
   - Generate new match card

3. **Verify image generation:**

   - Check `src/utils/imageGenerator.js`
   - Should use `t(guildId, 'key')`

### Database Errors

#### Guild Settings Not Found

**Problem:** "Guild settings missing" error

**Solutions:**

1. **Run migration:**

   ```powershell
   npm run db:migrate
   ```

2. **Manual creation:**

   ```sql
   INSERT INTO guild_settings (guild_id, locale)
   VALUES ('YOUR_GUILD_ID', 'en');
   ```

3. **Check table exists:**

   ```powershell
   psql -U postgres -d apolo_dota2 -c "\dt"
   ```

## Support

Need help?

- [Setup Guide](SETUP.md) - Installation instructions
- [Quick Start](QUICKSTART.md) - 5-minute setup
- [Main README](README.md) - Full documentation
- GitHub Issues - Report bugs

---

**Enjoy the new features!** 🎮
