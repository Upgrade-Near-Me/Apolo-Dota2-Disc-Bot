/* eslint-disable @typescript-eslint/no-explicit-any */
import { i18nService } from '../I18nService.js';
import type { Locale } from '../types/dota.js';
// @ts-expect-error - JavaScript module
import pool from '../database/index.js';

/**
 * Simple translation function wrapper for legacy code
 * @param guildId - Guild ID or interaction
 * @param key - Translation key
 * @param params - Optional parameters
 */
export function t(guildId: string | any, key: string, params?: Record<string, string | number>): string {
  // If first parameter is an interaction, extract guild ID
  const id = typeof guildId === 'string' ? guildId : guildId?.guild?.id || guildId?.guildId;
  
  // Get locale for this guild (synchronous fallback to 'en')
  const locale: Locale = 'en'; // Simple fallback since we can't await here
  
  return i18nService.t(locale, key, params);
}

/**
 * Load guild locale (legacy compatibility)
 * Accepts guild ID string or interaction object
 * @param guildIdOrInteraction - Guild ID string or Discord interaction
 */
export async function loadGuildLocale(guildIdOrInteraction: string | any): Promise<Locale> {
  try {
    // Extract guild ID from various input types
    const guildId = typeof guildIdOrInteraction === 'string' 
      ? guildIdOrInteraction 
      : guildIdOrInteraction?.guild?.id || guildIdOrInteraction?.guildId;
    
    if (!guildId) {
      console.warn('⚠️ No guild ID provided to loadGuildLocale, using default locale');
      return 'pt'; // Default to Portuguese for Brazilian servers
    }
    
    // Load from database
    const result = await pool.query(
      'SELECT locale FROM guild_settings WHERE guild_id = $1',
      [guildId]
    );
    
    if (result.rows.length > 0 && result.rows[0]?.locale) {
      const dbLocale = result.rows[0].locale;
      console.log(`🌍 Guild ${guildId} locale: ${dbLocale}`);
      return dbLocale as Locale;
    }
    
    // If not in database, return default Portuguese for Brazilian servers
    console.log(`🌍 Guild ${guildId} has no locale set, using default: pt`);
    return 'pt';
  } catch (error) {
    console.error('❌ Error loading guild locale:', error);
    return 'pt'; // Fallback to Portuguese on error
  }
}

export default { t, loadGuildLocale };
