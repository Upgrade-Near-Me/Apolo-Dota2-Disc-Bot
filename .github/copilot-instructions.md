# APOLO Dota 2 Bot - Enterprise Development Standards

## Project Vision

**Name:** APOLO-Dota2 - Enterprise-Grade Discord Bot

**Type:** Production SaaS-level tactical Dota 2 analysis platform

**Architecture Philosophy:** Scalable, maintainable, and globally accessible with zero compromises on performance or user experience.

## Current Status

**Version:** 2.1 (Production Ready)

**Completed Features:**

- ✅ Interactive Dashboard (8 specialized channels with button-based interface)
- ✅ Steam Account Connection (OpenDota verification pipeline)
- ✅ Team Balancer (MMR-based distribution with voice channel integration)
- ✅ Server Setup Automation (Creates 8 channels + 3 voice channels)
- ✅ Multi-language System (User-aware i18n: EN/PT-BR/ES with locale detection)
- ✅ TypeScript Migration (100% complete - all files migrated to .ts)
- ✅ Redis Caching Layer (API response cache + session management)
- ✅ 8 AI Analysis Tools (Performance, Trends, Weaknesses, Strengths, Heroes, Report, Compare, Tip)
- ✅ Content Hub (Stream announcements, social links, clips)
- ✅ LFG System (Looking For Group matchmaking with role/skill filters)
- ✅ Meta Analysis (Top heroes by position with win rates)
- ✅ Hero Build Guides (Item builds and skill progression)
- ✅ DM Messaging System (Private message delivery with ephemeral fallback)
- ✅ Structured Logging (Pino) - All console.log replaced with structured logging
- ✅ Comprehensive Error Handling - Centralized error mapping with graceful degradation
- ✅ Rate Limiting (Redis) - Protects Stratz (90 req/min), OpenDota (50 req/min), Gemini (15 req/min)
- ✅ Input Validation Layer - Steam ID, Discord ID, modal input validation
- ✅ Graceful Shutdown Handler - SIGTERM handling for DB/Redis/Discord cleanup
- ✅ Environment Validation - Fail-fast on missing critical env vars
- ✅ Unit Tests (Vitest) - Team Balancer 100% coverage (12 tests: snake draft, edge cases, 10v10)
- ✅ Sharding & IPC (Phase 17) - Core manager + IPC handler with integration tests passing (`tests/integration/sharding.test.ts`)

**Next Steps (Recommended Priority):**

1. 🔄 **Phase 11: E2E Tests** (4-6h) - Test Stratz, OpenDota, Steam, Gemini APIs with mock responses
2. 🔄 **Phase 12: Database Connection Pooling** (3-4h) - Optimize pg pool for 1M queries/day
3. 🔄 **Phase 13: Redis Optimization** (3-4h) - Connection pooling, key expiry, memory management
4. 🔄 **Phase 14: BullMQ Job Queues** (image/AI heavy tasks)
5. 🔄 **Phase 15: Prometheus Metrics** (latency, errors, health)

**Production Hardening (1M+ Users Scale):**

- ✅ Phase 10: Unit Tests (Vitest) - Team Balancer 100% coverage (12 tests, all passing)
- ⏳ Phase 11: E2E Tests - Stratz/OpenDota/Steam/Gemini integration tests
- ⏳ Phase 12: Database Connection Pooling - Optimize pg pool for 1M queries/day
- ⏳ Phase 13: Redis Optimization - Connection pooling, key expiry, memory management
- ⏳ Phase 14: Database Schema Optimization - Indexes, partitioning, query tuning
- ⏳ Phase 15: BullMQ Job Queues - Async image generation and heavy processing
- ⏳ Phase 16: Prometheus Metrics - Command latency, API response times, error rates
- ✅ Phase 17: Bot Sharding - Core sharding manager, IPC handler, integration tests green

### 🚀 Enterprise Scale Plan (1M+ users)

- Reference doc: `docs/SCALE_1M_ROADMAP.md` (phases, timeline, costs, risks, checklist)
- Quick wins (4h): input/env validation, structured logging, graceful shutdown, rate limiting
- Phase 1 (Foundation): logging, error handling, validation, Prometheus/health checks, Postgres/Redis tuning, unit tests
- Phase 2 (Sharding): Discord ShardingManager + IPC, shard-aware handlers, Redis cluster, DB pool scaling, load tests (~5k servers)
- Phase 3 (Optimization): BullMQ for heavy jobs (images/AI), schema/index tuning, aggressive caching, E2E APIs, profiling
- Phase 4 (Deployment): Kubernetes recommended (auto-scaling, rolling updates), GitOps, Prometheus + Grafana + ELK, backups and DR

## Tech Stack (Enterprise)

### Core Technologies

- **Runtime:** Node.js v20.18.1 with ES Modules (TypeScript)
- **Language:** TypeScript 5.9.3 with strict mode enabled
- **Framework:** Discord.js v14 (Button-based interactions)
- **Database:** PostgreSQL 14+ with connection pooling (pg)
- **Cache Layer:** Redis 7+ (ioredis) - Implemented for API caching
- **Image Generation:** @napi-rs/canvas (native bindings)
- **Chart Rendering:** chartjs-node-canvas
- **APIs:**
  - Stratz GraphQL (primary Dota 2 data, cached in Redis)
  - Steam Web API (hero images, profiles)
  - OpenDota REST (meta statistics, fallback)
  - Google Gemini AI (coaching advice with locale awareness)

### Development Tools

- **Container:** Docker + Docker Compose (production-ready multi-stage builds)
- **Code Quality:** ESLint + TypeScript strict mode
- **Testing:** Vitest (unit tests ready) + E2E test suite structure
- **Development:** tsx watch (auto-reload during development)
- **Build System:** TypeScript compiler with source maps

## Architecture

### Command Structure

**Admin Commands (Slash):**

- `/dashboard` - Opens interactive control panel
- `/setup-apolo-structure` - Creates 8 specialized channels (one-time use)
- `/remove-apolo-structure` - Removes all APOLO channels

**User Interactions (Buttons):**

All user features accessed via buttons in 8 specialized channels:

- ✅ 🔗 Connect - Link Steam account (modal → verification → confirmation)
- 🔄 📊 Match - Analyze latest match (Basic implementation)
- 🔄 👤 Profile - View statistics (Basic implementation)
- 🔄 📈 Progress - GPM/XPM evolution (Basic implementation)
- 🔄 🏆 Leaderboard - Server rankings (Basic implementation)
- ✅ 🎯 Meta - Current meta heroes (Implemented)
- ✅ 🛠️ Build - Hero item builds (Implemented)
- ✅ ⚖️ Balance - Team balancer (Implemented)
- ✅ 🤖 AI Coach - 8 analysis tools (Implemented)
- ✅ ℹ️ Help - Show help information (Implemented)
- ⚠️ 👤 Profile - View statistics (Not implemented yet)
- ⚠️ 📈 Progress - GPM/XPM evolution (Not implemented yet)
- ⚠️ 🏆 Leaderboard - Server rankings (Not implemented yet)
- ⚠️ 🎯 Meta - Current meta heroes (Not implemented yet)
- ⚠️ 🛠️ Build - Hero item builds (Not implemented yet)
- ✅ ⚖️ Balance - Team balancer (Implemented)
- ⚠️ 🤖 AI Coach - Personalized advice (Not implemented yet)
- ✅ ℹ️ Help - Show help information

### Directory Structure

```
src/
├── commands/               # Slash commands (admin only)
│   ├── dashboard.ts        # Main interactive dashboard (1065 lines)
│   ├── setup-dashboard.ts  # Server structure creator (680 lines)
│   └── remove-apolo-structure.ts
│
├── handlers/              # Interaction handlers
│   ├── buttonHandler.ts   # All button interactions (1600+ lines)
│   └── modalHandler.ts    # Modal submissions
│
├── services/               # API integration layer
│   ├── stratzService.ts   # Stratz GraphQL queries
│   ├── openDotaService.ts # OpenDota REST API
│   ├── GeminiService.ts   # Google Gemini AI
│   └── RedisService.ts    # Redis caching
│
├── utils/                 # Utility functions
│   ├── i18n.ts            # Multi-language system
│   ├── imageGenerator.ts  # Match card generation
│   ├── chartGenerator.ts  # Progress charts
│   ├── interactionGuard.ts # Safe Discord interactions
│   ├── dm.ts              # DM messaging utility
│   └── menuRefresh.ts     # Channel menu updates
│
├── database/              # Database layer
│   ├── index.ts           # PostgreSQL pool
│   └── migrate.ts         # Schema migrations
│
├── locales/               # Translation files
│   ├── en.json            # English
│   ├── pt.json            # Portuguese
│   └── es.json            # Spanish
│
├── types/                 # TypeScript definitions
│   └── dota.d.ts          # Dota 2 interfaces
│
├── config/
│   └── index.ts           # Environment config
│
├── tests/                 # Test suites
│   ├── unit/
│   │   └── teamBalancer.test.ts
│   └── e2e/
│
├── index.ts               # Bot entry point (682 lines)
├── deploy-commands.ts     # Global command registration
└── deploy-guilds.ts       # Guild-specific deployment
```

## 🌍 CRITICAL: Enterprise Internationalization (i18n)

### Mandatory Rules for Global Users

**ABSOLUTE REQUIREMENTS:**

1. **Codebase Language:** All code (variables, functions, comments, git commits) **MUST** be in English.
2. **No Hardcoded Strings:** Zero tolerance. Every user-facing string **MUST** use a translation key.
3. **Locale Priority Chain (User-First):**

```javascript
/**
 * Resolve user locale with priority chain:
 * 1. Guild setting (Admin override)
 * 2. interaction.locale (User's Discord client language) ← CRITICAL
 * 3. Fallback: 'en'
 */
function resolveLocale(interaction) {
  const guildId = interaction.guild?.id;
  
  // Priority 1: Guild-level override (if admin set server language)
  if (guildId) {
    const guildLocale = await getGuildLocale(guildId);
    if (guildLocale) return guildLocale;
  }
  
  // Priority 2: User's Discord client language (MOST IMPORTANT)
  // Maps Discord locale to our supported locales
  const discordLocale = interaction.locale; // e.g., 'pt-BR', 'en-US', 'es-ES'
  const userLang = mapDiscordLocale(discordLocale); // Returns 'pt', 'en', 'es'
  
  // Priority 3: Fallback
  return userLang || 'en';
}

/**
 * Map Discord locale codes to bot locales
 */
function mapDiscordLocale(discordLocale) {
  const map = {
    'pt-BR': 'pt',
    'pt': 'pt',
    'en-US': 'en',
    'en-GB': 'en',
    'es-ES': 'es',
    'es-MX': 'es',
    // Add more as needed
  };
  return map[discordLocale] || null;
}
```

4. **Translation Function Signature:**

```javascript
// OLD (guild-only - DEPRECATED)
t(guildId, 'key');

// NEW (user-aware - MANDATORY)
t(interaction, 'key', params);

// Implementation in src/utils/i18n.js
export function t(interaction, key, params = {}) {
  const locale = resolveLocale(interaction);
  let text = translations[locale]?.[key] || translations['en'][key] || key;
  
  // Replace parameters {username} → 'JohnDoe'
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}
```

5. **Example Usage (MANDATORY PATTERN):**

```javascript
// ❌ WRONG - Hardcoded
await interaction.reply({ content: 'Error loading match' });

// ❌ WRONG - Guild-only
const msg = t(guildId, 'match_error');

// ✅ CORRECT - User-aware
const msg = t(interaction, 'match_error');
await interaction.reply({ content: msg });

// ✅ CORRECT - With parameters
const greeting = t(interaction, 'welcome_user', { 
  username: interaction.user.username,
  rank: profile.rank 
});
```

6. **Database Schema (guild_settings table):**

```sql
CREATE TABLE guild_settings (
  guild_id VARCHAR(20) PRIMARY KEY,
  locale VARCHAR(5) DEFAULT NULL, -- NULL = use user's Discord locale
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

7. **Admin Language Override:**

```javascript
// /language command sets guild-wide override
async execute(interaction) {
  const locale = interaction.options.getString('locale'); // 'en', 'pt', 'es'
  
  await pool.query(
    `INSERT INTO guild_settings (guild_id, locale, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (guild_id) DO UPDATE SET locale = $2, updated_at = NOW()`,
    [interaction.guildId, locale]
  );
  
  await interaction.reply({
    content: t(interaction, 'language_updated'),
    ephemeral: true
  });
}
```

### Image Generation with Locale

**Match cards and charts MUST respect user locale:**

```javascript
async function generateMatchCard(matchData, interaction) {
  const locale = resolveLocale(interaction);
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Use translated strings
  const victoryText = t(interaction, matchData.victory ? 'victory' : 'defeat');
  const durationText = t(interaction, 'duration_label');
  
  ctx.fillText(victoryText, 400, 50);
  ctx.fillText(`${durationText}: ${matchData.duration}`, 400, 100);
  
  return canvas.toBuffer('image/png');
}
```

## 🏗️ CRITICAL: TypeScript Migration (Incremental)

### Mandatory Type Definitions

**All new files MUST be TypeScript. Legacy .js files will migrate gradually.**

**Example: src/types/dota.d.ts**

```typescript
export interface DotaMatch {
  matchId: string;
  steamId: string;
  heroId: number;
  heroName: string;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  duration: number; // seconds
  victory: boolean;
  playedAt: Date;
  items: number[]; // item IDs
  lane: 'SAFE' | 'MID' | 'OFF' | 'JUNGLE' | 'ROAMING';
  role: 'CARRY' | 'SUPPORT' | 'OFFLANE' | 'MID' | 'HARD_SUPPORT';
}

export interface PlayerProfile {
  steamId: string;
  discordId: string;
  name: string;
  avatarUrl: string;
  rank: string; // 'Herald', 'Guardian', ..., 'Immortal'
  mmr: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number; // percentage
  avgGpm: number;
  avgXpm: number;
  topHeroes: Array<{
    heroId: number;
    heroName: string;
    games: number;
    winRate: number;
  }>;
}

export interface StratzPlayerResponse {
  steamAccount: {
    id: string;
    name: string;
    avatar: string;
  };
  matchCount: number;
  winCount: number;
  // Add all Stratz fields
}
```

**Example: src/types/steam.d.ts**

```typescript
export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
}
```

### TypeScript Configuration (tsconfig.json - TO BE CREATED)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## 🔴 CRITICAL: Redis Caching Layer

### Mandatory Implementation

**Redis MUST be used for:**

1. **API Response Caching** (avoid Stratz 429 errors)
2. **User Session Management** (Steam connection flow)
3. **Guild Settings Cache** (reduce PostgreSQL load)

### Docker Compose (redis service - TO BE ADDED)

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  redis_data:
```

### Redis Service (src/services/redisService.js - TO BE CREATED)

```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

/**
 * Cache Stratz API response
 * TTL: 5 minutes for player profiles, 1 hour for match data
 */
export async function cacheStratzProfile(steamId, data) {
  const key = `stratz:profile:${steamId}`;
  await redis.setex(key, 300, JSON.stringify(data)); // 5 min TTL
}

export async function getCachedStratzProfile(steamId) {
  const key = `stratz:profile:${steamId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Cache match data (longer TTL - matches don't change)
 */
export async function cacheMatch(matchId, data) {
  const key = `match:${matchId}`;
  await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour
}

export async function getCachedMatch(matchId) {
  const key = `match:${matchId}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

/**
 * Guild settings cache (reduce PostgreSQL queries)
 */
export async function cacheGuildLocale(guildId, locale) {
  const key = `guild:${guildId}:locale`;
  await redis.set(key, locale); // No expiry - manual invalidation
}

export async function getCachedGuildLocale(guildId) {
  const key = `guild:${guildId}:locale`;
  return await redis.get(key);
}

export default redis;
```

### Usage in Stratz Service

```javascript
import { getCachedStratzProfile, cacheStratzProfile } from './redisService.js';

export async function getPlayerProfile(steamId) {
  // Check cache first
  const cached = await getCachedStratzProfile(steamId);
  if (cached) {
    console.log(`✅ Cache hit: ${steamId}`);
    return cached;
  }
  
  // Fetch from API
  console.log(`🌐 Fetching from Stratz: ${steamId}`);
  const data = await stratzGraphQLQuery(steamId);
  
  // Cache result
  await cacheStratzProfile(steamId, data);
  
  return data;
}
```

## 🚀 CRITICAL: BullMQ Job Queues

### Mandatory for Heavy Tasks

**BullMQ MUST handle:**

1. **Image Generation** (match cards, charts) - CPU intensive
2. **Match Analysis** (AI processing, calculations)
3. **Bulk Operations** (leaderboard recalculation)

### Bull Dashboard (Optional Monitoring)

```yaml
services:
  bull-board:
    image: deadly0/bull-board
    ports:
      - "3000:3000"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
```

### Job Queue Setup (src/jobs/imageGeneration.js - TO BE CREATED)

```javascript
import { Queue, Worker } from 'bullmq';
import redis from '../services/redisService.js';
import { generateMatchCard } from '../utils/imageGenerator.js';

const imageQueue = new Queue('image-generation', {
  connection: redis,
});

/**
 * Worker processes image generation jobs
 */
const imageWorker = new Worker('image-generation', async (job) => {
  const { matchData, locale } = job.data;
  
  console.log(`🖼️ Generating image for match ${matchData.matchId}`);
  
  const imageBuffer = await generateMatchCard(matchData, locale);
  
  return { imageBuffer: imageBuffer.toString('base64') };
}, {
  connection: redis,
  concurrency: 5, // Process 5 images simultaneously
});

imageWorker.on('completed', (job) => {
  console.log(`✅ Image generated: ${job.id}`);
});

imageWorker.on('failed', (job, err) => {
  console.error(`❌ Image failed: ${job.id}`, err);
});

/**
 * Enqueue image generation job
 */
export async function enqueueImageGeneration(matchData, locale) {
  const job = await imageQueue.add('generate-match-card', {
    matchData,
    locale,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
  
  return job.id;
}

/**
 * Wait for job completion and get result
 */
export async function waitForImage(jobId, timeout = 30000) {
  const job = await imageQueue.getJob(jobId);
  await job.waitUntilFinished(timeout);
  return Buffer.from(job.returnvalue.imageBuffer, 'base64');
}

export { imageQueue, imageWorker };
```

### Usage in Dashboard Button

```javascript
// dashboard.js - Match button handler
if (buttonId === 'dashboard_match') {
  await interaction.deferReply({ ephemeral: true });
  
  const matches = await getLastMatch(steamId);
  
  // Enqueue image generation
  const jobId = await enqueueImageGeneration(matches[0], resolveLocale(interaction));
  
  // Wait for completion (non-blocking for other users)
  const imageBuffer = await waitForImage(jobId);
  
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'match.png' });
  await interaction.editReply({ files: [attachment] });
}
```

## 🤖 AI Coach: Locale-Aware Gemini Integration

### System Prompt Injection (MANDATORY)

**Gemini MUST receive user locale in system prompt:**

```javascript
// src/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateCoachingAdvice(profile, matches, interaction) {
  const locale = resolveLocale(interaction);
  
  // Map locale to language name
  const languageMap = {
    'pt': 'Portuguese (Brazil)',
    'en': 'English',
    'es': 'Spanish',
  };
  
  const language = languageMap[locale] || 'English';
  
  const systemPrompt = `You are a professional Dota 2 coach and analyst.

CRITICAL INSTRUCTION: You MUST respond ONLY in ${language}. Do NOT use any other language.

Analyze the player's performance and provide:
1. Strengths (2-3 points)
2. Areas for improvement (2-3 points)
3. Specific actionable advice (3-5 tips)

Player Profile:
- Rank: ${profile.rank}
- MMR: ${profile.mmr}
- Win Rate: ${profile.winRate}%
- Avg GPM: ${profile.avgGpm}
- Avg XPM: ${profile.avgXpm}

Recent Matches:
${matches.map(m => `- ${m.heroName}: ${m.kills}/${m.deaths}/${m.assists} (${m.victory ? 'Win' : 'Loss'})`).join('\n')}

Provide coaching advice in ${language}.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(systemPrompt);
  
  return result.response.text();
}
```

## 🧪 MANDATORY: Testing Strategy

### Unit Tests (Vitest) - ✅ PHASE 10 COMPLETE

**Status:** Team Balancer with 100% test coverage (12 tests, all passing)

**Location:** `tests/unit/teamBalancer.test.ts` (293 lines)  
**Implementation:** `src/utils/teamBalancer.ts` (137 lines)

**What's Tested:**
- ✅ Snake draft algorithm (basic 6-player distribution)
- ✅ Unlinked players (MMR=0 handling)
- ✅ Edge cases (empty, single, odd counts)
- ✅ High skill disparity (Herald to Immortal)
- ✅ Quality scoring and validation
- ✅ 10-player realistic scenarios
- ✅ No duplicate or lost players
- ✅ Balance statistics accuracy

**Running Tests:**
```powershell
npm run test:unit          # Run tests
npm run test:coverage      # With coverage report
npm run test:ui            # Interactive dashboard
```

**Coverage Metrics:**
- Lines: 100% ✅
- Functions: 100% ✅
- Branches: 100% ✅
- Statements: 100% ✅

**Configuration:** `vitest.config.ts` with per-file thresholds (80%+ for tested code)

### E2E Tests (Pending - Phase 12)

**What to Test:**
- Stratz GraphQL API (player profiles, match data)
- OpenDota REST API (public profile verification)
- Steam Web API (player summaries, avatars)
- Google Gemini AI (response generation, locale)

**Template:**
```typescript
// tests/e2e/apis.test.ts (TO CREATE)
describe('Stratz API', () => {
  it('should fetch player profile', async () => {
    const profile = await stratzService.getPlayerProfile('123456');
    expect(profile).toHaveProperty('steamId');
  });
  
  it('should handle rate limits gracefully', async () => {
    // Test 429 fallback to OpenDota
  });
});
```

### E2E API Tests

```javascript
// tests/e2e/stratzApi.test.js
import { describe, it, expect } from 'vitest';
import { getPlayerProfile } from '../../src/services/stratzService.js';

describe('Stratz API Integration', () => {
  it('should fetch player profile', async () => {
    const profile = await getPlayerProfile('115431346'); // Known player
    
    expect(profile).toHaveProperty('steamId');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('rank');
    expect(profile.totalMatches).toBeGreaterThan(0);
  });
  
  it('should handle rate limiting with cache', async () => {
    // First call - API
    const profile1 = await getPlayerProfile('115431346');
    
    // Second call - should use cache
    const profile2 = await getPlayerProfile('115431346');
    
    expect(profile1).toEqual(profile2);
  });
});
```

### Run Tests

```powershell
# Install Vitest
npm install -D vitest

# Run unit tests
npm run test:unit

# Run E2E tests (requires API keys)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Development Guidelines

### Code Style (Enterprise Standards)

**ES Modules (TypeScript preferred):**

```typescript
// src/services/stratzService.ts
import { StratzPlayerResponse, PlayerProfile } from '../types/dota.js';

export async function getPlayerProfile(steamId: string): Promise<PlayerProfile> {
  // Implementation
}
```

**Async/Await (MANDATORY):**

```javascript
// ❌ WRONG - Promise chains
stratzService.getProfile(steamId)
  .then(data => interaction.editReply({ embeds: [embed] }))
  .catch(err => console.error(err));

// ✅ CORRECT - Async/await
async execute(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });
    const data = await stratzService.getProfile(steamId);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error:', error);
    await interaction.editReply({
      content: t(interaction, 'error_generic'),
    });
  }
}
```

**Error Handling (Structured Logging):**

```javascript
try {
  const data = await apiCall();
} catch (error) {
  // Structured error logging (prepare for monitoring)
  console.error({
    event: 'api_call_failed',
    service: 'stratz',
    steamId,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // User-friendly error message
  await interaction.editReply({
    content: t(interaction, 'error_api_unavailable'),
  });
}
```

### Button-Based Design (No Changes)

**Primary Pattern:**

```javascript
// Create buttons
const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('feature_action')
      .setLabel(t(guildId, 'button_label'))
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎮')
  );

// Send with buttons
await interaction.reply({ embeds: [embed], components: [row] });

// Handle button clicks in src/index.js
else if (interaction.isButton()) {
  if (interaction.customId.startsWith('dashboard_')) {
    const dashboardCommand = client.commands.get('dashboard');
    if (dashboardCommand && dashboardCommand.handleButton) {
      await dashboardCommand.handleButton(interaction);
    }
  }
}
```

**Modal Pattern (Connect Steam Example):**

```javascript
// 1. Show modal for user input (in handleButton)
const modal = new ModalBuilder()
  .setCustomId('connect_steam_modal')
  .setTitle(t(guildId, 'connect_modal_title'));

const steamIdInput = new TextInputBuilder()
  .setCustomId('steam_id_input')
  .setLabel(t(guildId, 'connect_modal_label'))
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const row = new ActionRowBuilder().addComponents(steamIdInput);
modal.addComponents(row);
await interaction.showModal(modal);

// 2. Handle modal submission (in handleModal)
async handleModal(interaction) {
  if (interaction.customId === 'connect_steam_modal') {
    const steamInput = interaction.fields.getTextInputValue('steam_id_input');
    await interaction.deferReply({ flags: 64 }); // ephemeral
    
    // Verify with OpenDota API
    const profile = await openDota.getPlayerProfile(steam32Id);
    
    // Show confirmation with buttons
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_steam_${steam32Id}`)
        .setLabel('✅ Confirm')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel_steam')
        .setLabel('❌ Cancel')
        .setStyle(ButtonStyle.Danger)
    );
    
    await interaction.editReply({ embeds: [embed], components: [confirmRow] });
  }
}

// 3. Handle confirmation (in src/index.js)
else if (interaction.customId.startsWith('confirm_steam_')) {
  const steam32Id = interaction.customId.replace('confirm_steam_', '');
  await interaction.deferUpdate();
  
  // Save to database
  await pool.query(
    `INSERT INTO users (discord_id, steam_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (discord_id) DO UPDATE SET steam_id = $2`,
    [interaction.user.id, steam32Id]
  );
  
  await interaction.editReply({ content: '✅ Connected!', components: [] });
}
```

### Multi-language Integration

**Always use translation function:**

```javascript
import { t } from '../utils/i18n.js';

// Get guild ID from interaction
const guildId = interaction.guild?.id;

// Translate strings
const title = t(guildId, 'dashboard_title');
const description = t(guildId, 'dashboard_description');

// With parameters
const message = t(guildId, 'welcome_user', { username: user.tag });
```

**Adding new translation keys:**

Edit `src/utils/i18n.js`:

```javascript
export const translations = {
  en: {
    new_key: 'English text',
    new_key_param: 'Hello {username}!'
  },
  pt: {
    new_key: 'Texto em português',
    new_key_param: 'Olá {username}!'
  },
  es: {
    new_key: 'Texto en español',
    new_key_param: '¡Hola {username}!'
  }
};
```

### Performance Requirements

**Response Time Targets:**

- Dashboard: < 500ms
- Match Analysis: < 2.5 seconds
- Profile: < 2 seconds
- Progress Charts: < 2.5 seconds
- Leaderboard: < 1 second
- Team Balance: < 3 seconds
- AI Coach: < 5 seconds

**Optimization Techniques:**

1. **Defer replies immediately:**

   ```javascript
   await interaction.deferReply();
   // Do heavy processing
   await interaction.editReply(response);
   ```

2. **Use database caching:**

   ```javascript
   // Check cache first
   const cached = await db.query('SELECT * FROM matches WHERE...');
   if (cached.rows.length > 0) return cached.rows[0];
   
   // Fetch from API if not cached
   const fresh = await stratzService.getMatch(matchId);
   await db.query('INSERT INTO matches VALUES...', fresh);
   ```

3. **Parallel API calls:**

   ```javascript
   const [profile, matches] = await Promise.all([
     stratzService.getProfile(steamId),
     stratzService.getMatches(steamId)
   ]);
   ```

### Database Patterns

**Connection Pooling:**

```javascript
import pool from '../database/index.js';

async function queryData(param) {
  const result = await pool.query(
    'SELECT * FROM users WHERE discord_id = $1',
    [param]
  );
  return result.rows[0];
}
```

**Transactions:**

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE users SET...');
  await client.query('INSERT INTO matches...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Image Generation

**Match Cards:**

```javascript
import { createCanvas, loadImage } from '@napi-rs/canvas';

async function generateMatchCard(matchData, locale) {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 0, 600);
  gradient.addColorStop(0, matchData.victory ? '#2ecc71' : '#e74c3c');
  gradient.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 600);
  
  // Load and draw hero portrait
  const heroImage = await loadImage(matchData.heroImageUrl);
  ctx.drawImage(heroImage, 50, 50, 200, 150);
  
  // Draw KDA
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${matchData.kills}/${matchData.deaths}/${matchData.assists}`, 300, 100);
  
  // Export as buffer
  return canvas.toBuffer('image/png');
}
```

**Charts:**

```javascript
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

async function generateProgressChart(data, metric, locale) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: 800,
    height: 400
  });
  
  const configuration = {
    type: 'line',
    data: {
      labels: data.map((_, i) => `${t(locale, 'match')} ${i + 1}`),
      datasets: [{
        label: t(locale, `metric_${metric}`),
        data: data.map(m => m[metric]),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }]
    }
  };
  
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
```

## Testing

### Local Testing

**IMPORTANT:** Bot runs in Docker. Local testing requires Docker setup.

```powershell
# Set test server ID in .env for instant deployment
DISCORD_GUILD_ID=your_test_server_id

# Start Docker containers
docker-compose up -d --build

# Run migrations (REQUIRED on first start)
docker-compose exec bot node src/database/migrate.js

# Deploy commands to Discord
docker-compose exec bot node src/deploy-commands.js

# View logs
docker-compose logs -f bot

# Restart after code changes
docker-compose restart bot
```

### Docker Testing

```powershell
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f bot

# Run migrations
docker-compose exec bot node src/database/migrate.js

# Deploy commands
docker-compose exec bot node src/deploy-commands.js
```

### Manual Test Checklist

**Working Features:**
- [x] Dashboard opens with all 12 buttons
- [x] Connect button shows modal for Steam ID
- [x] Connect → Steam ID validation (32/64/URL formats)
- [x] Connect → OpenDota profile verification
- [x] Connect → Confirmation embed with profile data
- [x] Connect → Confirm/Cancel buttons work
- [x] Connect → Saves to database on confirmation
- [x] Language button shows 3 language options (EN/PT/ES)
- [x] Language selection updates guild settings
- [x] Help button displays command information
- [x] Refresh button reloads dashboard

**Not Yet Implemented:**
- [ ] Match button analyzes last match
- [ ] Profile button shows statistics embed
- [ ] Progress button shows modal → generates chart
- [ ] Leaderboard button shows modal → displays top 10
- [ ] Meta button shows current meta heroes
- [ ] Build button shows modal → displays item build
- [ ] Balance button shows modal → balances teams
- [ ] AI Coach button generates personalized advice

## Common Tasks

### Adding a New Dashboard Button

1. **Edit `src/commands/dashboard.js` - Add button in execute():**

   ```javascript
   // Add button to row
   const newButton = new ButtonBuilder()
     .setCustomId('dashboard_new_feature')
     .setLabel(t(guildId, 'new_feature_btn'))
     .setStyle(ButtonStyle.Primary)
     .setEmoji('✨');
   
   row.addComponents(newButton);
   ```

2. **Add button handler in handleButton() method:**

   ```javascript
   async handleButton(interaction) {
     const buttonId = interaction.customId;
     
     if (buttonId === 'dashboard_new_feature') {
       await interaction.deferReply({ ephemeral: true });
       // Feature implementation
       await interaction.editReply(response);
       return;
     }
   }
   ```

3. **Add translations in `src/utils/i18n.js`:**

   ```javascript
   export const translations = {
     en: { new_feature_btn: 'New Feature' },
     pt: { new_feature_btn: 'Nova Funcionalidade' },
     es: { new_feature_btn: 'Nueva Característica' }
   };
   ```

4. **Rebuild Docker container:**

   ```powershell
   docker-compose up -d --build
   ```

### Current API Services

**Stratz API (Primary):**
- Automatically falls back to OpenDota if Cloudflare blocks
- Configured via `STRATZ_API_TOKEN` in `.env`
- May return 403 errors intermittently (fallback handles this)

**OpenDota API (Fallback):**
- No authentication required
- Used for Steam account verification
- Main methods: `getPlayerProfile()`, `getLastMatch()`, `getMatchHistory()`

**Adding a New API Service:**

1. **Create service file `src/services/newService.js`:**

   ```javascript
   // Node 20 has global fetch
   export async function fetchData(param) {
     const response = await fetch(`https://api.example.com/${param}`);
     if (!response.ok) throw new Error('API error');
     return await response.json();
   }
   ```

2. **Use in command:**

   ```javascript
   import * as newService from '../services/newService.js';
   
   const data = await newService.fetchData(param);
   ```

3. **Rebuild container:**

   ```powershell
   docker-compose up -d --build
   ```

### Adding a Database Table

1. **Edit `src/database/migrate.js`:**

   ```javascript
   await client.query(`
     CREATE TABLE IF NOT EXISTS new_table (
       id SERIAL PRIMARY KEY,
       guild_id VARCHAR(20) NOT NULL,
       data TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     )
   `);
   
   await client.query(`
     CREATE INDEX IF NOT EXISTS idx_new_table_guild
     ON new_table(guild_id)
   `);
   ```

2. **Run migration:**

   ```powershell
   npm run db:migrate
   # Or in Docker
   docker-compose exec bot node src/database/migrate.js
   ```

## API Reference

### Stratz GraphQL

**Endpoint:** `https://api.stratz.com/graphql`

**Authentication:** Bearer token in header

**Common Queries:**

- `player(steamAccountId)` - Player profile
- `player.matches` - Match history
- `match(id)` - Single match details
- `heroStats` - Meta statistics

**Rate Limits:** 1,000 requests/day (free tier)

### Steam Web API

**Endpoint:** `https://api.steampowered.com/`

**Authentication:** API key in query parameter

**Common Endpoints:**

- `/ISteamUser/GetPlayerSummaries/v2` - Player info
- `/IDOTA2Match_570/GetMatchDetails/v1` - Match data

**CDN:** `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/`

### OpenDota API

**Endpoint:** `https://api.opendota.com/api/`

**Authentication:** None required (public endpoints)

**Common Endpoints:**

- `/heroStats` - Hero win rates
- `/constants/heroes` - Hero metadata
- `/players/{account_id}` - Player profile

**Rate Limits:** 60 requests/minute

### Google Gemini AI

**Endpoint:** Via `@google/generative-ai` SDK

**Authentication:** API key

**Model:** `gemini-1.5-flash`

**Configuration:**

- Max tokens: 1000
- Temperature: 0.7
- Top-p: 0.95

**Rate Limits:** 60 requests/minute (free tier)

## Troubleshooting

### Common Issues

**Bot Not Responding:**

- Check if bot is online in Discord
- Verify `DISCORD_TOKEN` in `.env`
- Check logs: `docker-compose logs -f bot`
- Ensure containers are running: `docker-compose ps`

**Commands Not Appearing:**

- Run `docker-compose exec bot node src/deploy-commands.js`
- Wait 5-10 minutes for global deployment
- Use `DISCORD_GUILD_ID` for instant test server deployment
- Restart Discord client to clear cache

**Database Errors:**

- Verify PostgreSQL is running: `docker-compose ps`
- Check `DATABASE_URL` format in `.env`
- Run migrations: `docker-compose exec bot node src/database/migrate.js`
- Ensure `DATABASE_URL` uses `postgres` hostname (not `localhost`)

**"This interaction failed" Error:**

- Check bot logs for actual error: `docker-compose logs --tail=50 bot`
- Verify all methods exist: `execute()`, `handleButton()`, `handleModal()`
- Ensure button CustomIds match handler checks
- Verify modal submission handlers exist in `src/index.js`

**Docker Build Fails:**

- Clear cache: `docker-compose down -v && docker system prune -af`
- Rebuild: `docker-compose build --no-cache --pull`
- Check Dockerfile syntax errors
- Ensure all required files exist in src/

**Stratz API 403 Forbidden (Cloudflare):**

- **Expected behavior** - Cloudflare blocks some requests
- Bot automatically falls back to OpenDota
- No action needed - fallback system handles this
- To test: Modal shows OpenDota profile data successfully

**Steam Connection Not Working:**

- Verify OpenDota API is accessible
- Check Steam ID format (32/64/URL)
- Ensure database migrations ran
- Test with known working Steam ID: `115431346`
- Check logs for import errors in `dashboard.js`

## Resources

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Stratz API Docs](https://docs.stratz.com/)
- [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API)
- [Google Gemini Docs](https://ai.google.dev/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For help:

- Check [README.md](../README.md) for general documentation
- Review [SETUP.md](../SETUP.md) for installation guide
- Read [FEATURES.md](../FEATURES.md) for feature details
- See [DOCKER.md](../DOCKER.md) for container deployment

---

**Last Updated:** 2024-01
**Maintained by:** Development Team
