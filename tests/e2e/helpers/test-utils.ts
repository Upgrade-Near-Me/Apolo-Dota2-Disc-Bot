/**
 * Mock Server Setup Helpers
 * Provides utilities for mocking fetch() and managing mock responses
 */

import { vi } from 'vitest';

/**
 * Mock response for fetch
 */
interface MockFetchResponse {
  status: number;
  json: () => Promise<Record<string, unknown>>;
  text?: () => Promise<string>;
  ok: boolean;
}

/**
 * Setup global fetch mock with routing
 * Returns a map of {url: response} for easy test setup
 */
export function setupMockFetch() {
  const mockResponses = new Map<
    string,
    MockFetchResponse | Error
  >();

  global.fetch = vi.fn(
    async (
      input: string | URL | Request,
      options?: RequestInit
    ): Promise<Response> => {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

      // Find matching mock response
      for (const [pattern, response] of mockResponses.entries()) {
        if (urlStr.includes(pattern)) {
          if (response instanceof Error) {
            throw response;
          }

          // Return mock response
          return {
            ok: response.ok,
            status: response.status,
            json: response.json,
            text: response.text,
            headers: new Headers(),
            redirected: false,
            statusText: `Status ${response.status}`,
            type: 'basic' as ResponseType,
            url: urlStr,
            clone: () => ({} as Response),
            arrayBuffer: async () => new ArrayBuffer(0),
            blob: async () => new Blob(),
            formData: async () => new FormData(),
            body: null,
            bodyUsed: false,
          } as Response;
        }
      }

      // No mock found - throw error
      throw new Error(`No mock found for URL: ${urlStr}`);
    }
  ) as any;

  return {
    /**
     * Register a mock response for a URL pattern
     */
    mockResponse: (
      urlPattern: string,
      status: number,
      data: Record<string, unknown>
    ) => {
      mockResponses.set(urlPattern, {
        status,
        ok: status >= 200 && status < 300,
        json: async () => data,
      });
    },

    /**
     * Register an error response
     */
    mockError: (urlPattern: string, error: Error) => {
      mockResponses.set(urlPattern, error);
    },

    /**
     * Clear all mocks
     */
    clear: () => {
      mockResponses.clear();
      vi.clearAllMocks();
    },

    /**
     * Get fetch mock for assertions
     */
    getFetchMock: () => global.fetch as unknown as ReturnType<typeof vi.fn>,
  };
}

/**
 * Delay simulation for latency testing
 */
export async function simulateLatency(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test API response timing
 */
export async function measureResponseTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Mock Redis for cache testing
 */
export function setupMockRedis() {
  const cache = new Map<string, unknown>();

  return {
    /**
     * Set a value in cache
     */
    set: async (key: string, value: unknown) => {
      cache.set(key, value);
    },

    /**
     * Get a value from cache
     */
    get: async (key: string) => {
      return cache.get(key) || null;
    },

    /**
     * Delete a value from cache
     */
    del: async (key: string) => {
      cache.delete(key);
    },

    /**
     * Check if key exists
     */
    exists: async (key: string) => {
      return cache.has(key) ? 1 : 0;
    },

    /**
     * Clear all cache
     */
    flushAll: async () => {
      cache.clear();
    },

    /**
     * Get all keys matching pattern
     */
    keys: async (pattern: string) => {
      return Array.from(cache.keys()).filter((key) => {
        // Simple pattern matching
        const regex = new RegExp(
          pattern.replace(/\*/g, '.*')
        );
        return regex.test(key);
      });
    },
  };
}

/**
 * Test utilities for common scenarios
 */
export const testHelpers = {
  /**
   * Assert API was called with correct parameters
   */
  assertApiCalled: (
    fetchMock: ReturnType<typeof vi.fn>,
    urlPattern: string,
    method = 'GET'
  ) => {
    const calls = fetchMock.mock.calls;
    const found = calls.some((callArgs: any[]) => {
      const [url, options] = callArgs;
      return (
        url.includes(urlPattern) &&
        (!options || options.method === method)
      );
    });
    return found;
  },

  /**
   * Get call count for a specific URL pattern
   */
  getCallCount: (
    fetchMock: ReturnType<typeof vi.fn>,
    urlPattern: string
  ): number => {
    return fetchMock.mock.calls.filter((callArgs: any[]) => {
      const [url] = callArgs;
      return url.includes(urlPattern);
    }).length;
  },

  /**
   * Extract request body from mock call
   */
  getRequestBody: (
    fetchMock: ReturnType<typeof vi.fn>,
    index = 0
  ): unknown => {
    const call = fetchMock.mock.calls[index];
    if (!call || !call[1]) return null;
    return (call[1] as RequestInit).body;
  },
};

/**
 * Mock Database for testing
 */
export function setupMockDatabase() {
  const tables = new Map<string, unknown[]>();

  return {
    /**
     * Query database (simple mock)
     */
    query: async (sql: string, params?: unknown[]) => {
      // Simple query simulation
      return { rows: [], rowCount: 0 };
    },

    /**
     * Insert row
     */
    insert: (
      table: string,
      data: Record<string, unknown>
    ) => {
      const rows = tables.get(table) || [];
      rows.push(data);
      tables.set(table, rows);
      return { id: rows.length };
    },

    /**
     * Get rows
     */
    getRows: (table: string) => {
      return tables.get(table) || [];
    },

    /**
     * Clear table
     */
    clearTable: (table: string) => {
      tables.set(table, []);
    },

    /**
     * Clear all tables
     */
    clearAll: () => {
      tables.clear();
    },
  };
}

/**
 * Test data generators
 */
export const generateTestData = {
  /**
   * Generate fake Steam ID (32-bit)
   */
  steamId32: (seed = 1) => {
    return 155431346 + seed;
  },

  /**
   * Generate fake Discord ID
   */
  discordId: (seed = 1) => {
    return '702405288854028300' + seed;
  },

  /**
   * Generate fake Match ID
   */
  matchId: (seed = 1) => {
    return 7847229420 + seed;
  },

  /**
   * Generate player profile
   */
  playerProfile: (overrides = {}) => {
    return {
      steamId: '115431346',
      name: 'Test Player',
      rank: 'Divine',
      mmr: 7700,
      totalMatches: 450,
      wins: 235,
      avgGpm: 542,
      avgXpm: 612,
      ...overrides,
    };
  },

  /**
   * Generate match data
   */
  matchData: (overrides = {}) => {
    return {
      matchId: '7847229421',
      steamId: '115431346',
      heroName: 'Anti-Mage',
      kills: 15,
      deaths: 3,
      assists: 8,
      gpm: 542,
      xpm: 612,
      duration: 2143,
      victory: true,
      playedAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Generate multiple matches
   */
  matchHistory: (count = 5, overrides = {}) => {
    return Array.from({ length: count }, (_, i) =>
      generateTestData.matchData({
        matchId: String(7847229420 + i),
        victory: i % 2 === 0,
        ...overrides,
      })
    );
  },
};

export default {
  setupMockFetch,
  simulateLatency,
  measureResponseTime,
  setupMockRedis,
  setupMockDatabase,
  testHelpers,
  generateTestData,
};
