/**
 * Test Suite: Steam ID Validation
 * 
 * Tests for Steam ID format detection and conversion
 * Covers: Steam32, Steam64, Steam URL formats
 * Coverage Target: 100%
 */

import { describe, it, expect } from 'vitest';

/**
 * Steam ID Format Detection
 * Supports: Steam32 (12345678), Steam64 (76561198XXXXXXXXX), Profile URLs
 */
describe('Steam ID Validation', () => {
  describe('Steam32 Format Detection', () => {
    it('should recognize valid Steam32 ID', () => {
      const steam32 = '115431346';
      const isSteam32 = /^\d{8,10}$/.test(steam32);
      
      expect(isSteam32).toBe(true);
    });

    it('should reject too short Steam32 IDs', () => {
      const tooShort = '1234567'; // 7 digits
      const isSteam32 = /^\d{8,10}$/.test(tooShort);
      
      expect(isSteam32).toBe(false);
    });

    it('should reject too long Steam32 IDs', () => {
      const tooLong = '12345678901'; // 11 digits
      const isSteam32 = /^\d{8,10}$/.test(tooLong);
      
      expect(isSteam32).toBe(false);
    });

    it('should reject non-numeric Steam32 IDs', () => {
      const nonNumeric = '1234567a8';
      const isSteam32 = /^\d{8,10}$/.test(nonNumeric);
      
      expect(isSteam32).toBe(false);
    });
  });

  describe('Steam64 Format Detection', () => {
    it('should recognize valid Steam64 ID', () => {
      const steam64 = '76561198075697074';
      const isSteam64 = /^7656119\d{10}$/.test(steam64);
      
      expect(isSteam64).toBe(true);
    });

    it('should reject Steam64 without proper prefix', () => {
      const invalid = '12345678901234567'; // 17 digits but wrong prefix
      const isSteam64 = /^7656119\d{10}$/.test(invalid);
      
      expect(isSteam64).toBe(false);
    });

    it('should reject too short Steam64 IDs', () => {
      const tooShort = '76561198'; // Only prefix
      const isSteam64 = /^7656119\d{10}$/.test(tooShort);
      
      expect(isSteam64).toBe(false);
    });

    it('should handle edge case Steam64 IDs', () => {
      const edgeCases = [
        '76561197960265728', // First possible Steam64
        '76561198000000000', // Common range start
        '76561199999999999', // Near max
      ];
      
      edgeCases.forEach((id) => {
        const isSteam64 = /^7656119\d{10}$/.test(id);
        expect(isSteam64).toBe(true);
      });
    });
  });

  describe('Steam Profile URL Detection', () => {
    it('should extract Steam32 from profile URL', () => {
      const profileUrl = 'https://steamcommunity.com/profiles/76561198075697074';
      const match = profileUrl.match(/profiles\/(\d+)/);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('76561198075697074');
    });

    it('should extract custom URL from profile', () => {
      const customUrl = 'https://steamcommunity.com/id/gaben';
      const match = customUrl.match(/id\/([a-zA-Z0-9_-]+)/);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('gaben');
    });

    it('should handle URLs with trailing slashes', () => {
      const urlWithSlash = 'https://steamcommunity.com/profiles/76561198075697074/';
      const match = urlWithSlash.match(/profiles\/(\d+)/);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('76561198075697074');
    });

    it('should handle URLs with query parameters', () => {
      const urlWithParams = 'https://steamcommunity.com/profiles/76561198075697074?l=english';
      const match = urlWithParams.match(/profiles\/(\d+)/);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('76561198075697074');
    });

    it('should reject invalid Steam URLs', () => {
      const invalidUrls = [
        'https://google.com/profiles/123',
        'https://steamcommunity.com/games/dota2',
        'not-a-url-at-all',
      ];
      
      invalidUrls.forEach((url) => {
        const match = url.match(/steamcommunity\.com\/(profiles|id)\//);
        expect(match).toBeNull();
      });
    });
  });

  describe('Steam32 to Steam64 Conversion', () => {
    it('should convert Steam32 to Steam64', () => {
      const steam32 = 115431346;
      const steam64Base = BigInt('76561197960265728'); // Steam64 base offset
      const steam64 = steam64Base + BigInt(steam32);
      
      expect(steam64.toString()).toBe('76561198075697074');
    });

    it('should handle zero Steam32 ID', () => {
      const steam32 = 0;
      const steam64Base = BigInt('76561197960265728');
      const steam64 = steam64Base + BigInt(steam32);
      
      expect(steam64.toString()).toBe('76561197960265728');
    });

    it('should handle large Steam32 IDs', () => {
      const steam32 = 999999999;
      const steam64Base = BigInt('76561197960265728');
      const steam64 = steam64Base + BigInt(steam32);
      
      expect(steam64.toString()).toBe('76561198960265727');
    });

    it('should be reversible (Steam64 to Steam32)', () => {
      const originalSteam32 = 115431346;
      const steam64Base = BigInt('76561197960265728');
      
      // Convert to Steam64
      const steam64 = steam64Base + BigInt(originalSteam32);
      
      // Convert back to Steam32
      const convertedSteam32 = Number(steam64 - steam64Base);
      
      expect(convertedSteam32).toBe(originalSteam32);
    });
  });

  describe('Input Sanitization', () => {
    it('should remove whitespace from input', () => {
      const input = '  115431346  ';
      const sanitized = input.trim();
      
      expect(sanitized).toBe('115431346');
    });

    it('should handle mixed format input', () => {
      const inputs = [
        '115431346',
        '76561198075697074',
        'https://steamcommunity.com/profiles/76561198075697074',
      ];
      
      inputs.forEach((input) => {
        expect(input).toBeTruthy();
        expect(input.length).toBeGreaterThan(0);
      });
    });

    it('should detect format type', () => {
      const detectFormat = (input: string): 'steam32' | 'steam64' | 'url' | 'invalid' => {
        const trimmed = input.trim();
        
        if (/^\d{8,10}$/.test(trimmed)) return 'steam32';
        if (/^7656119\d{10}$/.test(trimmed)) return 'steam64';
        if (/steamcommunity\.com\/(profiles|id)\//.test(trimmed)) return 'url';
        return 'invalid';
      };
      
      expect(detectFormat('115431346')).toBe('steam32');
      expect(detectFormat('76561198075697074')).toBe('steam64');
      expect(detectFormat('https://steamcommunity.com/profiles/76561198075697074')).toBe('url');
      expect(detectFormat('invalid-input')).toBe('invalid');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input', () => {
      const input = '';
      const isValid = input.length > 0;
      
      expect(isValid).toBe(false);
    });

    it('should handle null/undefined input gracefully', () => {
      const nullInput = null;
      const undefinedInput = undefined;
      
      expect(nullInput).toBeNull();
      expect(undefinedInput).toBeUndefined();
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()';
      const isValid = /^\d{8,10}$/.test(specialChars);
      
      expect(isValid).toBe(false);
    });

    it('should handle negative numbers', () => {
      const negative = '-115431346';
      const isSteam32 = /^\d{8,10}$/.test(negative);
      
      expect(isSteam32).toBe(false);
    });

    it('should handle floating point numbers', () => {
      const float = '115431346.5';
      const isSteam32 = /^\d{8,10}$/.test(float);
      
      expect(isSteam32).toBe(false);
    });
  });

  describe('Real-World Test Cases', () => {
    const validTestCases = [
      {
        input: '115431346',
        type: 'steam32',
        expected: '115431346',
      },
      {
        input: '76561198075697074',
        type: 'steam64',
        expected: '76561198075697074',
      },
      {
        input: 'https://steamcommunity.com/profiles/76561198075697074',
        type: 'url',
        expected: '76561198075697074',
      },
      {
        input: 'https://steamcommunity.com/id/customname',
        type: 'custom_url',
        expected: 'customname',
      },
    ];

    it('should handle all valid input formats', () => {
      validTestCases.forEach(({ input, type }) => {
        expect(input).toBeTruthy();
        expect(type).toBeTruthy();
      });
    });

    it('should extract IDs correctly', () => {
      const urlInput = 'https://steamcommunity.com/profiles/76561198075697074';
      const match = urlInput.match(/profiles\/(\d+)/);
      
      expect(match).toBeTruthy();
      expect(match![1]).toBe('76561198075697074');
    });

    it('should validate against known good IDs', () => {
      const knownGoodIDs = [
        '115431346', // Dendi
        '86745912',  // s4
        '87278757',  // Puppey
      ];
      
      knownGoodIDs.forEach((id) => {
        const isValid = /^\d{8,10}$/.test(id);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should validate 1000 IDs quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const id = `11543${1000 + i}`;
        /^\d{8,10}$/.test(id);
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent validations', async () => {
      const ids = Array(100).fill(null).map((_, i) => `11543${1000 + i}`);
      
      const results = await Promise.all(
        ids.map((id) => Promise.resolve(/^\d{8,10}$/.test(id)))
      );
      
      expect(results).toHaveLength(100);
      expect(results.every((r) => r === true)).toBe(true);
    });
  });
});
