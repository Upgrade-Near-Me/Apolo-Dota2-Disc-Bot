/* eslint-disable @typescript-eslint/no-explicit-any */
import { i18nService } from '../I18nService.js';
import type { Locale, TranslationParams } from '../types/dota.js';
import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  ModalSubmitInteraction,
} from 'discord.js';

/**
 * Simple translation function wrapper for legacy code
 * @param guildId - Guild ID or interaction
 * @param key - Translation key
 * @param params - Optional parameters
 */
export type SupportedInteraction =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | ModalSubmitInteraction
  | (Interaction & { locale?: string });

/**
 * Resolve locale following priority chain:
 * 1. Guild override from database
 * 2. User's Discord client locale
 * 3. Fallback to English
 */
export async function resolveLocale(interaction: SupportedInteraction): Promise<Locale> {
  return i18nService.getLocale(interaction as any);
}

/**
 * New async translator that resolves locale from interaction.
 */
export async function tInteraction(
  interaction: SupportedInteraction,
  key: string,
  params?: TranslationParams
): Promise<string> {
  const locale = await resolveLocale(interaction);
  return i18nService.t(locale, key, params);
}

/**
 * Legacy sync translator kept for compatibility where interaction is not available.
 */
export function tLegacy(guildId: string | any, key: string, params?: Record<string, string | number>): string {
  const locale: Locale = 'en';
  return i18nService.t(locale, key, params as TranslationParams);
}

export default { tInteraction, tLegacy, resolveLocale };
