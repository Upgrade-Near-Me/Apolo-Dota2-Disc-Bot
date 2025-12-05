# 🧪 Phase 11: E2E API Integration Tests

**Goal:** Test all external API integrations (Stratz, OpenDota, Steam, Gemini) with mock responses to prevent breaking changes and ensure graceful degradation.

**Status:** 🚀 Starting Phase 11

**Estimated Time:** 4-6 hours

**Priority:** HIGH - Protects against API breaking changes before optimization phases

---

## 📋 Phase 11 Scope

### APIs to Test

| API | Service | Tests Needed | Mocks Required | Priority |
|-----|---------|--------------|----------------|----------|
| **Stratz** | `stratzService.ts` | Player profile, matches, hero stats | GraphQL responses | 1 (Primary) |
| **OpenDota** | `openDotaService.ts` | Profile verification, fallback | REST JSON responses | 2 (Fallback) |
| **Steam** | Steam Web API calls | Player summaries, avatars | JSON responses | 3 (Metadata) |
| **Gemini** | `GeminiService.ts` | AI coaching responses | Text generation | 4 (AI Analysis) |

### Test Categories

#### 1. Happy Path Tests ✅
- Successful API responses
- Data parsing and transformation
- Cache population

#### 2. Error Handling Tests 🚨
- Rate limit (429) responses
- Not found (404) errors
- Server errors (500)
- Network timeouts
- Invalid responses

#### 3. Fallback Tests 🔄
- Stratz → OpenDota fallback when blocked
- Graceful degradation
- Partial data availability

#### 4. Edge Cases 🔍
- Empty datasets
- Malformed responses
- Missing optional fields
- Extreme values (1M+ MMR)

### File Structure

```
tests/
├── e2e/
│   ├── apis.test.ts                 # Main E2E test suite
│   ├── fixtures/
│   │   ├── stratz-responses.ts       # Mock Stratz GraphQL responses
│   │   ├── opendota-responses.ts     # Mock OpenDota REST responses
│   │   ├── steam-responses.ts        # Mock Steam API responses
│   │   └── gemini-responses.ts       # Mock Gemini AI responses
│   └── helpers/
│       ├── mock-server.ts            # Mock HTTP server setup
│       └── test-utils.ts             # Helper functions
└── unit/
    └── teamBalancer.test.ts          # Existing tests (keep as-is)
```

---

## 🧩 Implementation Plan

### Step 1: Create Mock Fixtures (30 min)

**stratz-responses.ts** - GraphQL responses for:
- ✅ Player profile (name, MMR, matches)
- ✅ Match details (KDA, items, duration)
- ✅ Hero stats (win rates by position)
- ✅ Error responses (rate limit, invalid query)

**opendota-responses.ts** - REST responses for:
- ✅ Player profile summary
- ✅ Match history
- ✅ Public match data
- ✅ Error responses

**steam-responses.ts** - Web API responses for:
- ✅ Player summaries
- ✅ Avatar URLs
- ✅ Profile URLs
- ✅ Error responses

**gemini-responses.ts** - AI responses for:
- ✅ Coaching advice (Portuguese, English, Spanish)
- ✅ Performance analysis
- ✅ Error responses

### Step 2: Create Mock Server (1 hour)

**mock-server.ts** - HTTP mock infrastructure:
- ✅ Intercept fetch() calls
- ✅ Route based on URL
- ✅ Return fixture responses
- ✅ Support delay simulation (latency testing)
- ✅ Support failure injection (error testing)

### Step 3: Write E2E Tests (2-3 hours)

**apis.test.ts** - Comprehensive test suite:

```
describe('Stratz API', () => {
  describe('getPlayerProfile()', () => {
    it('should fetch player profile successfully')
    it('should parse MMR and rank correctly')
    it('should handle private profiles gracefully')
    it('should cache results in Redis')
  })
  
  describe('Error Handling', () => {
    it('should fallback to OpenDota on 403 Forbidden')
    it('should retry on network timeout')
    it('should throw on 401 Unauthorized')
    it('should handle rate limit (429)')
  })
})

describe('OpenDota API', () => {
  describe('getPlayerProfile()', () => {
    it('should verify public profiles')
    it('should extract Steam ID correctly')
  })
})

describe('Steam Web API', () => {
  describe('getPlayerSummary()', () => {
    it('should fetch player summaries')
    it('should resolve avatar URLs')
  })
})

describe('Gemini AI', () => {
  describe('generateCoachingAdvice()', () => {
    it('should generate advice in user locale')
    it('should handle rate limits gracefully')
    it('should inject system prompt correctly')
  })
})
```

### Step 4: Integration Tests (1-2 hours)

**Full request/response flows:**
- Connect Steam → Verify OpenDota → Save to DB
- Analyze match → Generate images → Send Discord response
- Team balance → Fetch MMR → Move members → Post results

### Step 5: Documentation (30 min)

- E2E test patterns guide
- How to add new mock fixtures
- Running tests (CI/CD)

---

## 🛠️ Technical Details

### Mock Strategy

**Option A: Vitest `vi.mock()`** (Recommended)

```typescript
import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn(async (url: string) => {
  if (url.includes('stratz.com')) {
    return { json: async () => mockStratzResponse };
  }
  return { json: async () => mockOpenDotaResponse };
});
```

**Option B: MSW (Mock Service Worker)**

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.post('https://api.stratz.com/graphql', (req, res, ctx) => {
    return res(ctx.json(mockStratzResponse));
  })
);
```

**Recommendation:** Use **Vitest `vi.mock()`** for simplicity (already have Vitest v4)

### Testing Pattern

```typescript
describe('Stratz API', () => {
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Reset Redis
    await redis.flushAll();
  });

  it('should fetch and cache player profile', async () => {
    // 1. Mock fetch
    global.fetch = vi.fn(() => ({
      json: async () => mockResponse,
    }));

    // 2. Call service
    const profile = await stratzService.getPlayerProfile('12345');

    // 3. Verify fetch called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('stratz.com'),
      expect.objectContaining({
        headers: { 'Authorization': 'Bearer TOKEN' },
      })
    );

    // 4. Verify response parsed
    expect(profile.steamId).toBe('12345');

    // 5. Verify cached
    const cached = await redis.get('stratz:profile:12345');
    expect(cached).toBeDefined();
  });
});
```

### Error Testing Pattern

```typescript
it('should fallback to OpenDota on 403 Forbidden', async () => {
  // Mock Stratz to return 403
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ 
      status: 403, 
      json: async () => ({ errors: [{ message: 'Forbidden' }] }) 
    })
    .mockResolvedValueOnce({ 
      status: 200,
      json: async () => openDotaMockResponse 
    });

  const profile = await stratzService.getPlayerProfile('12345');
  
  // Should succeed via OpenDota
  expect(profile).toBeDefined();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
```

---

## 📊 Phase 11 Deliverables

### Test Files Created

| File | Purpose | Tests | Status |
|------|---------|-------|--------|
| `tests/e2e/apis.test.ts` | Main E2E suite | ~40-50 | ⏳ To Create |
| `tests/e2e/fixtures/stratz-responses.ts` | Stratz mocks | 6+ response types | ⏳ To Create |
| `tests/e2e/fixtures/opendota-responses.ts` | OpenDota mocks | 4+ response types | ⏳ To Create |
| `tests/e2e/fixtures/steam-responses.ts` | Steam mocks | 3+ response types | ⏳ To Create |
| `tests/e2e/fixtures/gemini-responses.ts` | Gemini mocks | 3+ response types | ⏳ To Create |

### Coverage Goals

```
APIs:
  Stratz:        ✅ 100% coverage (happy path + errors + fallbacks)
  OpenDota:      ✅ 100% coverage (profile + history + errors)
  Steam:         ✅ 100% coverage (summaries + avatars + errors)
  Gemini:        ✅ 100% coverage (advice + locales + errors)

Services:
  stratzService.ts:     ✅ All functions tested
  openDotaService.ts:   ✅ All functions tested
  GeminiService.ts:     ✅ All functions tested
  RedisService.ts:      ✅ Cache ops tested (already via Stratz tests)
```

### Test Execution

```powershell
# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:e2e:coverage

# Run specific API
npm run test:e2e -- stratz

# Watch mode (development)
npm run test:e2e -- --watch
```

---

## 🚀 Implementation Order

### Day 1-2: Foundation (2-3 hours)

1. Create mock fixture files
2. Setup mock server helpers
3. Write basic Stratz profile test
4. Verify mocking strategy works

### Day 2-3: Core APIs (2-3 hours)

5. Write Stratz tests (profile, matches, fallback)
6. Write OpenDota tests (verification, fallback)
7. Write Steam tests (summaries, avatars)
8. Write Gemini tests (advice, locales)

### Day 3-4: Integration (1-2 hours)

9. Write full flow tests (Connect → Verify → Save)
10. Write error scenarios (rate limits, network errors)
11. Test graceful degradation
12. Documentation

---

## 📝 Success Criteria

- ✅ **40-50 E2E tests** written and passing
- ✅ **100% API coverage** (happy path + errors + fallbacks)
- ✅ **0 external API calls** during testing (all mocked)
- ✅ **< 5 seconds** total test execution time
- ✅ **Clear documentation** for adding new tests
- ✅ **CI/CD ready** (can run in automated workflows)

---

## 🔗 Next Steps After Phase 11

**Phase 12: Database Connection Pooling** (3-4 hours)
- Optimize pg pool for 1M queries/day
- Connection reuse strategy
- Retry logic for failed connections

**Phase 13: Redis Optimization** (3-4 hours)
- Connection pooling
- Key expiry policies
- Memory management

---

## 📚 Resources

- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [Fetch Mocking with Vitest](https://vitest.dev/guide/mocking.html#globals)
- [E2E Testing Best Practices](https://testing-library.com/)

---

**Ready to start Phase 11? Let's test those APIs! 🧪**
