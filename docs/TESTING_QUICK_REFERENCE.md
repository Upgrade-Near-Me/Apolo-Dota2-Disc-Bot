# 📋 Testing Quick Reference

Quick guide for running and adding tests to the Apolo Dota 2 Bot.

## Quick Start

### Run Tests
```powershell
# Run all unit tests
npm run test:unit

# Run with coverage report
npm run test:coverage

# Run interactive UI
npm run test:ui

# Run specific test file
npm run test:unit -- tests/unit/teamBalancer.test.ts

# Run specific test by name
npm run test:unit -- --grep "snake draft"

# Watch mode (re-run on changes)
npm run test:unit -- --watch
```

## Current Test Coverage

| Component | Tests | Coverage | Status |
|-----------|-------|----------|--------|
| Team Balancer | 12 | 100% | ✅ Complete |
| Rate Limiter | — | 0% | ⏳ Pending |
| Error Handler | — | 0% | ⏳ Pending |
| Validation | — | 0% | ⏳ Pending |
| Image Generator | — | 0% | ⏳ Pending |
| Chart Generator | — | 0% | ⏳ Pending |

## Test File Template

Create tests in `tests/unit/` or `tests/e2e/` directories:

```typescript
/**
 * Unit Tests - [Component Name]
 * Run with: npm run test:unit
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { functionToTest } from '../../src/utils/functionName.js';

describe('Component Name', () => {
  /**
   * TEST: Description of what this test does
   */
  it('should do something specific', () => {
    // Setup
    const input = 'test data';
    
    // Execute
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });

  it('should handle edge case', () => {
    const input = null;
    const result = functionToTest(input);
    expect(result).toEqual({ error: 'invalid input' });
  });
});
```

## Common Assertions

```typescript
// Equality
expect(result).toBe(value);              // Strict equality
expect(result).toEqual(value);           // Deep equality
expect(result).toStrictEqual(value);     // Strict deep equality

// Truthiness
expect(result).toBeTruthy();             // true, 1, 'string', [], {}
expect(result).toBeFalsy();              // false, 0, '', null, undefined

// Numbers
expect(result).toBeGreaterThan(5);
expect(result).toBeGreaterThanOrEqual(5);
expect(result).toBeLessThan(5);
expect(result).toBeCloseTo(5, 2);        // Within 2 decimal places

// Arrays/Objects
expect(result).toContain('item');        // Array contains value
expect(result).toHaveProperty('key');    // Object has key
expect(result).toHaveLength(3);          // Array/String length

// Error handling
expect(() => fn()).toThrow();            // Throws error
expect(() => fn()).toThrow('message');   // Throws specific message
expect(fn()).rejects.toThrow();          // Async error

// Strings
expect(result).toMatch(/pattern/);       // Regex match
expect(result).toContain('substring');   // Contains substring
```

## Adding Tests for New Features

### Step 1: Create Test File
```bash
# Create test file in tests/unit/
touch tests/unit/myFeature.test.ts
```

### Step 2: Write Tests
```typescript
import { describe, it, expect } from 'vitest';
import { myFeature } from '../../src/utils/myFeature.js';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(myFeature(5)).toBe(10);
  });
});
```

### Step 3: Run Tests
```powershell
npm run test:unit
```

### Step 4: Check Coverage
```powershell
npm run test:coverage
```

## Best Practices

### ✅ Do

- **Test behavior, not implementation** - What should happen, not how it happens
- **Use descriptive names** - `it('should return error when name is empty')`
- **Test edge cases** - Empty, null, negative, very large values
- **Use beforeEach/afterEach** - Setup and cleanup
- **Organize with describe** - Group related tests
- **Keep tests focused** - One assertion per test usually
- **Use constants** - Avoid magic numbers
- **Mock external dependencies** - Don't call real APIs in tests

### ❌ Don't

- **Don't test internal details** - Focus on public API
- **Don't make tests interdependent** - Each test should stand alone
- **Don't have side effects** - Tests shouldn't affect other tests
- **Don't use excessive mocking** - Test real logic when possible
- **Don't ignore failing tests** - Fix or mark as pending
- **Don't skip error cases** - Test error paths thoroughly
- **Don't hardcode paths** - Use imports or configuration

## Debugging Tests

### Run Single Test
```powershell
npm run test:unit -- --grep "specific test name"
```

### Run with Debug Output
```powershell
npm run test:unit -- --reporter=verbose
```

### Use Console Logs
```typescript
it('debug test', () => {
  const result = functionToTest(input);
  console.log('Result:', result);  // Will show in test output
  expect(result).toBe(expected);
});
```

### Run in Watch Mode
```powershell
npm run test:unit -- --watch
```

## Coverage Requirements

### Current Policy

- **Tested files:** 80% minimum coverage (lines, functions, statements)
- **Tested files:** 75% minimum coverage (branches)
- **Untested files:** No requirement

### View Coverage Report

```powershell
# Generate HTML report
npm run test:coverage

# Open in browser (if generated)
open coverage/index.html
```

## Performance Notes

- **Typical test duration:** <1ms per test
- **Full suite execution:** ~7ms
- **Coverage analysis:** ~330ms
- **Watch mode rebuild:** <500ms

## Common Issues

### "Cannot find module"
- Check import paths use `.js` extension
- Verify file exists in correct location
- Run `npm run build` to compile TypeScript

### "Unexpected token"
- Check TypeScript syntax
- Ensure `.ts` extension on test files
- Run `npm run type-check` to verify

### "Test timeout"
- Default timeout: 10 seconds
- Increase if needed: `it('test', async () => {...}, 20000)`
- Avoid infinite loops

### "Coverage not updating"
- Clear cache: `npm run test:coverage -- --reporter=verbose`
- Check `vitest.config.ts` perFile setting
- Ensure test file in `tests/unit/` directory

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm run test:unit

- name: Generate coverage
  run: npm run test:coverage
```

### Pre-commit Hook
```bash
#!/bin/bash
npm run test:unit || exit 1
```

## Resources

- 📖 [Vitest Docs](https://vitest.dev/)
- 📖 [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
- 📖 [Jest Assertions](https://jestjs.io/docs/expect) (mostly compatible)
- 🎓 [Testing Best Practices](https://testingjavascript.com/)

## Next Test Targets

Priority order for test implementation:

1. **Rate Limiter** - Critical for API protection
2. **Validation** - Prevents malformed inputs
3. **Error Handler** - Ensures graceful failures
4. **Services** - Stratz, OpenDota, Gemini integrations
5. **Handlers** - Button and modal interactions

---

**Last Updated:** 2025-01
**Maintained by:** Development Team
