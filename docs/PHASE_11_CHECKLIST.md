# 🚀 Phase 11 E2E Tests - Implementation Checklist

**Status:** 🟡 IN PROGRESS - Fixtures Created, Tests Ready to Write

**Created:** 2025-12-04  
**Target Completion:** 2025-12-05 (4-6 hours)  
**Priority:** HIGH

---

## ✅ Completed (Fixtures & Setup)

### Fixture Files Created

- ✅ `tests/e2e/fixtures/stratz-responses.ts`
  - 16 mock responses (happy path + errors + edge cases)
  - Player profile, rank, matches, hero stats
  - Rate limits, unauthorized, server errors
  - Extreme MMR, Herald, Unranked, Veteran player

- ✅ `tests/e2e/fixtures/opendota-responses.ts`
  - 13 mock responses (REST endpoints)
  - Player profile, matches, match history
  - Hero stats, constants
  - Error responses (404, 429, 500, 401)

- ✅ `tests/e2e/fixtures/steam-responses.ts`
  - 11 mock responses (Web API)
  - Player summaries, multiple players
  - Private profiles, disabled accounts, new accounts
  - Avatar URLs and profile URLs

- ✅ `tests/e2e/fixtures/gemini-responses.ts`
  - 15 mock responses (AI coaching)
  - Advice in English, Portuguese, Spanish
  - 8 analysis types (performance, trends, weaknesses, etc.)
  - Error responses, new player, pro level

### Helper Files Created

- ✅ `tests/e2e/helpers/test-utils.ts`
  - Mock fetch setup and routing
  - Mock Redis (cache testing)
  - Mock database utilities
  - Test data generators
  - Response timing measurements

### Documentation Created

- ✅ `docs/PHASE_11_E2E_TESTS.md`
  - Detailed phase overview
  - APIs to test and scope
  - Implementation plan
  - Testing patterns and examples
  - Success criteria

---

## ⏳ Todo (Main E2E Tests)

### 1️⃣ Write Core E2E Test Suite

**File:** `tests/e2e/apis.test.ts` (to create)

```typescript
describe('Stratz API', () => {
  // ✅ Happy path: Player profile fetch
  // ✅ Happy path: Match history retrieval
  // ✅ Happy path: Hero stats (meta)
  // ✅ Error: Rate limit fallback
  // ✅ Error: 401 Unauthorized
  // ✅ Error: 500 Server error
  // ✅ Edge case: Private profile
  // ✅ Edge case: New account (0 matches)
  // ✅ Edge case: Extreme MMR (12k+)
})

describe('OpenDota API', () => {
  // ✅ Happy path: Profile verification
  // ✅ Happy path: Match data retrieval
  // ✅ Error: 404 Not found
  // ✅ Error: 429 Rate limit
  // ✅ Edge case: Private profile
})

describe('Steam Web API', () => {
  // ✅ Happy path: Player summary
  // ✅ Happy path: Multiple players
  // ✅ Error: Invalid API key
  // ✅ Error: User not found
  // ✅ Edge case: Disabled account
})

describe('Gemini AI', () => {
  // ✅ Happy path: Coaching advice
  // ✅ Happy path: Multiple locales (EN, PT, ES)
  // ✅ Error: Rate limit
  // ✅ Error: Invalid input
  // ✅ Edge case: New player
})
```

**Estimated tests:** 40-50

### 2️⃣ Write Fallback & Integration Tests

**Integration flows to test:**

```typescript
describe('API Fallback Chain', () => {
  // Stratz 403 → OpenDota success
  // OpenDota 404 → graceful failure
  // Partial data handling
  // Cache hit optimization
})

describe('Full Request Flows', () => {
  // Connect Steam → Verify → Save to DB
  // Analyze match → Generate images → Send Discord
  // Team balance → Fetch MMR → Calculate scores
})

describe('Error Scenarios', () => {
  // Network timeout handling
  // Malformed API responses
  // Missing required fields
  // Rate limit retry logic
})
```

### 3️⃣ Test Configuration Updates

- ✅ `vitest.config.ts` - Already includes tests/**/*
- ✅ `tsconfig.json` - Already includes tests/**/*
- ⏳ `.eslintignore` - May need to add tests/e2e patterns

### 4️⃣ Add Test Scripts

**Update package.json:**

```json
"scripts": {
  "test:e2e": "vitest tests/e2e --run",
  "test:e2e:watch": "vitest tests/e2e",
  "test:e2e:coverage": "vitest tests/e2e --coverage",
  "test:all": "vitest --run",
  "test:all:watch": "vitest"
}
```

---

## 📊 Test Coverage Goals

### API Coverage

| API | Tests | Coverage |
|-----|-------|----------|
| Stratz | 12-15 | 100% (happy + errors + fallback) |
| OpenDota | 8-10 | 100% (profile + verification) |
| Steam | 6-8 | 100% (summaries + avatars) |
| Gemini | 8-12 | 100% (advice + locales + errors) |
| **TOTAL** | **40-50** | **100% API coverage** |

### Feature Coverage

- ✅ Profile fetching (all services)
- ✅ Match analysis (Stratz + OpenDota)
- ✅ Cache operations (Redis)
- ✅ Fallback chain (Stratz → OpenDota)
- ✅ Error handling (all error types)
- ✅ Edge cases (extreme values, empty data)
- ✅ Rate limiting (429 responses)
- ✅ Locale handling (PT, EN, ES)

### Performance Metrics

```
Target:
  - Response time: < 100ms per test
  - Total test suite: < 5 seconds
  - No external API calls (all mocked)
  - 0 flaky tests
```

---

## 🛠️ Implementation Workflow

### Day 1: Core Tests (2-3 hours)

1. Create `tests/e2e/apis.test.ts` template
2. Write Stratz API tests (12-15 tests)
3. Write OpenDota API tests (8-10 tests)
4. Verify all tests pass with mocks

### Day 2: Additional Tests (2-3 hours)

5. Write Steam Web API tests (6-8 tests)
6. Write Gemini AI tests (8-12 tests)
7. Write fallback chain tests (5-8 tests)
8. Write integration flow tests (5-8 tests)

### Day 3: Polish & Docs (1-2 hours)

9. Run full test suite and verify coverage
10. Add test scripts to package.json
11. Document test patterns and how to add new tests
12. Verify CI/CD ready

---

## 📝 Test Pattern Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setupMockFetch, generateTestData } from './helpers/test-utils';
import * as stratzService from '@/services/stratzService';
import * as mockResponses from './fixtures/stratz-responses';

describe('Stratz API', () => {
  let mock: ReturnType<typeof setupMockFetch>;

  beforeEach(() => {
    mock = setupMockFetch();
  });

  describe('getPlayerProfile()', () => {
    it('should fetch player profile successfully', async () => {
      // Setup
      mock.mockResponse('stratz.com', 200, mockResponses.mockStratzPlayerProfile);

      // Execute
      const profile = await stratzService.getPlayerProfile('115431346');

      // Assert
      expect(profile).toBeDefined();
      expect(profile.steamId).toBe('115431346');
      expect(profile.name).toBe('Test Player');
      expect(mock.getFetchMock()).toHaveBeenCalledTimes(1);
    });

    it('should fallback to OpenDota on 403 Forbidden', async () => {
      // Setup: Stratz returns 403, OpenDota returns 200
      mock.mockResponse('stratz.com', 403, { errors: [{ message: 'Forbidden' }] });
      mock.mockResponse('opendota.com', 200, mockOpenDotaResponses.mockOpenDotaProfile);

      // Execute
      const profile = await stratzService.getPlayerProfile('115431346');

      // Assert
      expect(profile).toBeDefined();
      expect(mock.getFetchMock()).toHaveBeenCalledTimes(2); // Tried both APIs
    });
  });
});
```

---

## 🎯 Success Criteria

✅ **All Tests Pass**
- 40-50 E2E tests written
- 100% passing rate
- 0 flaky tests
- < 5 seconds execution

✅ **Full API Coverage**
- Stratz: All methods tested
- OpenDota: All methods tested  
- Steam: All methods tested
- Gemini: All methods tested

✅ **Error Scenarios Covered**
- Rate limits (429)
- Unauthorized (401)
- Server errors (500)
- Network timeouts
- Malformed responses

✅ **Documentation Complete**
- Clear testing patterns
- How to add new tests
- CI/CD integration ready

---

## 📚 Files to Review Before Writing Tests

1. `src/services/stratzService.ts` - Stratz API calls
2. `src/services/openDotaService.ts` - OpenDota API calls
3. `src/services/GeminiService.ts` - Gemini AI calls
4. `src/database/index.ts` - Database operations
5. `src/utils/i18n.ts` - Translation/locale handling

---

## 🚀 Next Phase Preview

**Phase 12: Database Connection Pooling** (3-4 hours)
- Optimize PostgreSQL pool for 1M queries/day
- Connection reuse and retry strategies
- Test with high-concurrency scenarios

**Phase 13: Redis Optimization** (3-4 hours)
- Connection pooling
- Key expiry policies
- Memory management for 1M concurrent users

---

## 📞 Quick Reference

**Commands:**
```powershell
# Run all E2E tests
npm run test:e2e

# Watch mode (development)
npm run test:e2e:watch

# With coverage report
npm run test:e2e:coverage

# Run specific test file
npm run test:e2e -- stratz.test.ts
```

**Mock Setup:**
```typescript
import { setupMockFetch, generateTestData } from './helpers/test-utils';

const mock = setupMockFetch();
mock.mockResponse('api.example.com', 200, { data: 'response' });
```

**Generate Test Data:**
```typescript
import { generateTestData } from './helpers/test-utils';

const player = generateTestData.playerProfile({ mmr: 8000 });
const matches = generateTestData.matchHistory(10);
```

---

**🎯 Goal:** Complete Phase 11 by 2025-12-05 with 40-50 passing E2E tests  
**📊 Progress:** Fixtures ✅ | Tests ⏳ | Documentation ✅

Let's write some tests! 🧪
