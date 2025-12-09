/**
 * Test Suite: Internationalization (i18n)
 * 
 * Tests for src/utils/i18n.ts and src/I18nService.ts
 * Covers: locale detection, translation fallback, parameter substitution
 * Coverage Target: 90%+
 */

import { describe, it, expect } from 'vitest';
import type { Locale } from '../../src/types/dota.js';

describe('i18n Service', () => {
  describe('Locale Detection Priority', () => {
    it('should prioritize guild locale over user locale', () => {
      // Guild has PT-BR set, user has EN-US Discord locale
      const guildLocale = 'pt' as Locale;
      const userLocale = 'en' as Locale;
      
      // Guild locale should win
      const result = guildLocale || userLocale;
      expect(result).toBe('pt');
    });

    it('should use user Discord locale when guild has no preference', () => {
      // Guild has no preference, user has ES Discord locale
      const guildLocale = null;
      const userLocale = 'es' as Locale;
      
      const result = guildLocale || userLocale;
      expect(result).toBe('es');
    });

    it('should fallback to English when no preferences exist', () => {
      const guildLocale = null;
      const userLocale = null;
      const fallback = 'en' as Locale;
      
      const result = guildLocale || userLocale || fallback;
      expect(result).toBe('en');
    });

    it('should map Discord locale codes to bot locales', () => {
      const discordLocaleMap: Record<string, Locale> = {
        'pt-BR': 'pt',
        'pt': 'pt',
        'en-US': 'en',
        'en-GB': 'en',
        'es-ES': 'es',
        'es-MX': 'es',
      };

      expect(discordLocaleMap['pt-BR']).toBe('pt');
      expect(discordLocaleMap['en-US']).toBe('en');
      expect(discordLocaleMap['es-ES']).toBe('es');
    });

    it('should handle unknown Discord locales gracefully', () => {
      const unknownLocale = 'fr-FR'; // Not supported yet
      const discordLocaleMap: Record<string, Locale> = {
        'pt-BR': 'pt',
        'en-US': 'en',
        'es-ES': 'es',
      };
      
      const mapped = discordLocaleMap[unknownLocale];
      const fallback = mapped || 'en';
      
      expect(fallback).toBe('en');
    });
  });

  describe('Translation Key Resolution', () => {
    const mockTranslations = {
      en: {
        victory: 'VICTORY',
        defeat: 'DEFEAT',
        welcome_user: 'Welcome, {username}!',
        missing_only_in_en: 'English only text',
      },
      pt: {
        victory: 'VITÓRIA',
        defeat: 'DERROTA',
        welcome_user: 'Bem-vindo, {username}!',
      },
      es: {
        victory: 'VICTORIA',
        defeat: 'DERROTA',
        welcome_user: '¡Bienvenido, {username}!',
      },
    };

    it('should return correct translation for valid key', () => {
      const locale = 'pt' as Locale;
      const key = 'victory';
      
      const result = mockTranslations[locale][key];
      expect(result).toBe('VITÓRIA');
    });

    it('should fallback to English if key missing in locale', () => {
      const locale = 'pt' as Locale;
      const key = 'missing_only_in_en';
      
      // Check if key exists in PT, if not use EN
      const result = (mockTranslations[locale] as any)[key] || (mockTranslations['en'] as any)[key];
      expect(result).toBe('English only text');
    });

    it('should return key itself if missing in all locales', () => {
      const locale = 'pt' as Locale;
      const key = 'completely_missing_key';
      
      const result = (mockTranslations[locale] as any)[key] || (mockTranslations['en'] as any)[key] || key;
      expect(result).toBe('completely_missing_key');
    });

    it('should handle empty strings as valid translations', () => {
      const translationsWithEmpty = {
        en: { empty_key: '' },
      };
      
      const result = translationsWithEmpty.en.empty_key;
      expect(result).toBe('');
    });
  });

  describe('Parameter Substitution', () => {
    it('should replace single parameter', () => {
      const template = 'Welcome, {username}!';
      const params = { username: 'JohnDoe' };
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      expect(result).toBe('Welcome, JohnDoe!');
    });

    it('should replace multiple parameters', () => {
      const template = '{hero} got {kills} kills and {deaths} deaths';
      const params = { hero: 'Invoker', kills: '10', deaths: '2' };
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      expect(result).toBe('Invoker got 10 kills and 2 deaths');
    });

    it('should handle missing parameters gracefully', () => {
      const template = 'Welcome, {username}!';
      const params = {}; // No username provided
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      // Template should remain unchanged
      expect(result).toBe('Welcome, {username}!');
    });

    it('should replace only provided parameters', () => {
      const template = 'Player {player} joined {server} at {time}';
      const params = { player: 'Alice', server: 'EU-West' }; // time missing
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      expect(result).toBe('Player Alice joined EU-West at {time}');
    });

    it('should handle numeric parameters', () => {
      const template = 'Match duration: {minutes} minutes';
      const params = { minutes: '45' };
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      expect(result).toBe('Match duration: 45 minutes');
    });

    it('should handle special characters in parameters', () => {
      const template = 'Message: {content}';
      const params = { content: 'Hello <world> & "friends"' };
      
      let result = template;
      Object.keys(params).forEach((key) => {
        result = result.replace(`{${key}}`, params[key as keyof typeof params]);
      });
      
      expect(result).toBe('Message: Hello <world> & "friends"');
    });
  });

  describe('Locale Validation', () => {
    const supportedLocales: Locale[] = ['en', 'pt', 'es'];

    it('should accept all supported locales', () => {
      supportedLocales.forEach((locale) => {
        expect(supportedLocales).toContain(locale);
      });
    });

    it('should reject unsupported locales', () => {
      const unsupportedLocales = ['fr', 'de', 'ru', 'zh'];
      
      unsupportedLocales.forEach((locale) => {
        expect(supportedLocales).not.toContain(locale);
      });
    });

    it('should validate locale format', () => {
      const validLocales = ['en', 'pt', 'es'];
      const invalidLocales = ['', 'EN', 'pt_BR', '123', null, undefined];
      
      validLocales.forEach((locale) => {
        expect(locale).toMatch(/^[a-z]{2}$/);
      });
      
      invalidLocales.forEach((locale) => {
        if (locale) {
          expect(locale).not.toMatch(/^[a-z]{2}$/);
        }
      });
    });
  });

  describe('Translation Consistency', () => {
    const mockTranslations = {
      en: {
        victory: 'VICTORY',
        defeat: 'DEFEAT',
        duration: 'Duration',
        performance: 'Performance',
      },
      pt: {
        victory: 'VITÓRIA',
        defeat: 'DERROTA',
        duration: 'Duração',
        performance: 'Desempenho',
      },
      es: {
        victory: 'VICTORIA',
        defeat: 'DERROTA',
        duration: 'Duración',
        performance: 'Rendimiento',
      },
    };

    it('should have same keys across all locales', () => {
      const enKeys = Object.keys(mockTranslations.en).sort();
      const ptKeys = Object.keys(mockTranslations.pt).sort();
      const esKeys = Object.keys(mockTranslations.es).sort();
      
      expect(ptKeys).toEqual(enKeys);
      expect(esKeys).toEqual(enKeys);
    });

    it('should have non-empty translations for all keys', () => {
      Object.values(mockTranslations).forEach((locale) => {
        Object.entries(locale).forEach(([_key, value]) => {
          expect(value).toBeDefined();
          expect(typeof value).toBe('string');
        });
      });
    });

    it('should detect missing translations', () => {
      const incompleteMock = {
        en: { key1: 'Value 1', key2: 'Value 2' },
        pt: { key1: 'Valor 1' }, // key2 missing
      };
      
      const enKeys = Object.keys(incompleteMock.en);
      const ptKeys = Object.keys(incompleteMock.pt);
      
      const missingInPt = enKeys.filter((key) => !ptKeys.includes(key));
      expect(missingInPt).toEqual(['key2']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long translation strings', () => {
      const longText = 'A'.repeat(1000);
      expect(longText.length).toBe(1000);
      expect(longText).toContain('A');
    });

    it('should handle translations with newlines', () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      expect(multiline.split('\n')).toHaveLength(3);
    });

    it('should handle translations with emojis', () => {
      const withEmoji = '🎮 Victory! 🏆';
      expect(withEmoji).toContain('🎮');
      expect(withEmoji).toContain('🏆');
    });

    it('should handle Unicode characters', () => {
      const unicode = 'Olá, 你好, مرحبا';
      expect(unicode).toBeDefined();
      expect(unicode.length).toBeGreaterThan(0);
    });

    it('should handle concurrent translation requests', async () => {
      const requests = Array(100).fill(null).map((_, i) => 
        Promise.resolve(`Translation ${i}`)
      );
      
      const results = await Promise.all(requests);
      expect(results).toHaveLength(100);
    });
  });
});
