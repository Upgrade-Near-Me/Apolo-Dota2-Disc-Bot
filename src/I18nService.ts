import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Locale, TranslationParams } from './types/dota.js';
import type { 
  ChatInputCommandInteraction, 
  ButtonInteraction, 
  ModalSubmitInteraction 
} from 'discord.js';
import type { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import pool dynamically to avoid TypeScript errors with .js imports
let pool: Pool;
import('./database/index.js').then((module) => {
  pool = module.default;
}).catch(() => {
  console.error('Failed to load database pool');
});

/**
 * Supported Discord interaction types
 */
type SupportedInteraction = 
  | ChatInputCommandInteraction 
  | ButtonInteraction 
  | ModalSubmitInteraction;

/**
 * Translation data structure
 */
type Translations = {
  [key in Locale]: Record<string, string>;
};

/**
 * I18n Service - Manages internationalization for the bot
 * 
 * Locale Priority Chain:
 * 1. Guild-level setting (admin override in database)
 * 2. User's Discord client language (interaction.locale)
 * 3. Fallback to 'en' (English)
 */
export class I18nService {
  private translations: Translations;
  private localeCache: Map<string, Locale> = new Map();

  constructor() {
    this.translations = this.loadTranslations();
  }

  /**
   * Load all translation files into memory
   */
  private loadTranslations(): Translations {
    const localesDir = join(__dirname, 'locales');
    
    const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf-8')) as Record<string, string>;
    const pt = JSON.parse(readFileSync(join(localesDir, 'pt.json'), 'utf-8')) as Record<string, string>;
    const es = JSON.parse(readFileSync(join(localesDir, 'es.json'), 'utf-8')) as Record<string, string>;

    return { en, pt, es };
  }

  /**
   * Map Discord locale codes to bot locales
   * 
   * @param discordLocale - Discord's locale code (e.g., 'pt-BR', 'en-US')
   * @returns Bot locale code or null if not supported
   */
  private mapDiscordLocale(discordLocale: string): Locale | null {
    const map: Record<string, Locale> = {
      'pt-BR': 'pt',
      'pt': 'pt',
      'en-US': 'en',
      'en-GB': 'en',
      'en': 'en',
      'es-ES': 'es',
      'es-MX': 'es',
      'es': 'es',
    };
    
    return map[discordLocale] || null;
  }

  /**
   * Get guild-level locale from database (cached)
   * 
   * @param guildId - Discord guild ID
   * @returns Guild locale or null if not set
   */
  private async getGuildLocale(guildId: string): Promise<Locale | null> {
    // Check cache first
    if (this.localeCache.has(guildId)) {
      return this.localeCache.get(guildId) || null;
    }

    try {
      const result = await pool.query<{ locale: Locale }>(
        'SELECT locale FROM guild_settings WHERE guild_id = $1',
        [guildId]
      );

      const row = result.rows[0];
      if (row?.locale) {
        this.localeCache.set(guildId, row.locale);
        return row.locale;
      }
    } catch (error) {
      console.error('Error fetching guild locale:', error);
    }

    return null;
  }

  /**
   * Get locale with priority chain:
   * 1. Guild setting (admin override)
   * 2. User's Discord client language
   * 3. Fallback to 'en'
   * 
   * @param interaction - Discord interaction object
   * @param guildId - Optional guild ID (defaults to interaction.guild?.id)
   * @returns Resolved locale code
   */
  async getLocale(
    interaction: SupportedInteraction,
    guildId?: string
  ): Promise<Locale> {
    const actualGuildId = guildId || interaction.guild?.id;

    // Priority 1: Guild-level override
    if (actualGuildId) {
      const guildLocale = await this.getGuildLocale(actualGuildId);
      if (guildLocale) {
        return guildLocale;
      }
    }

    // Priority 2: User's Discord client language
    if (interaction.locale) {
      const userLocale = this.mapDiscordLocale(interaction.locale);
      if (userLocale) {
        return userLocale;
      }
    }

    // Priority 3: Fallback
    return 'en';
  }

  /**
   * Translate a key to the specified locale
   * 
   * @param locale - Target locale
   * @param key - Translation key
   * @param params - Optional parameters for variable replacement
   * @returns Translated string with parameters replaced
   * 
   * @example
   * ```typescript
   * i18n.t('en', 'welcome_user', { username: 'JohnDoe' })
   * // Returns: "Welcome, JohnDoe!"
   * ```
   */
  t(locale: Locale, key: string, params?: TranslationParams): string {
    // Get translation from locale or fallback to English
    let text = this.translations[locale]?.[key] 
               || this.translations['en'][key] 
               || key;

    // Log missing key for developers
    if (!this.translations[locale]?.[key] && !this.translations['en'][key]) {
      console.warn(`Missing translation key: ${key} (locale: ${locale})`);
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, String(params[param]));
      });
    }

    return text;
  }

  /**
   * Clear locale cache for a specific guild
   * Call this when guild settings are updated
   * 
   * @param guildId - Discord guild ID
   */
  clearGuildCache(guildId: string): void {
    this.localeCache.delete(guildId);
  }

  /**
   * Clear entire locale cache
   * Useful for testing or after bulk updates
   */
  clearCache(): void {
    this.localeCache.clear();
  }
}

// Singleton instance
export const i18nService = new I18nService();
