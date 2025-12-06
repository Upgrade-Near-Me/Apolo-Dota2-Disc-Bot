/**
 * Dashboard Button Definitions
 * All action rows and buttons for dashboard
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { i18nService } from '../../I18nService.js';
import type { Locale } from '../../types/dota.js';

export function getDashboardButtons(locale: Locale): ActionRowBuilder[] {
  const rows: ActionRowBuilder[] = [];

  // Row 1: Analytics
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_connect')
        .setLabel(i18nService.t(locale, 'btn_connect') || 'Connect')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setCustomId('dashboard_profile')
        .setLabel(i18nService.t(locale, 'btn_profile') || 'Profile')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('dashboard_match')
        .setLabel(i18nService.t(locale, 'btn_match') || 'Match')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📈'),
      new ButtonBuilder()
        .setCustomId('dashboard_reports')
        .setLabel(i18nService.t(locale, 'btn_reports') || 'Reports')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    )
  );

  // Row 2: Meta & Strategy
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_meta')
        .setLabel(i18nService.t(locale, 'btn_meta') || 'Meta')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎮'),
      new ButtonBuilder()
        .setCustomId('dashboard_builds')
        .setLabel(i18nService.t(locale, 'btn_builds') || 'Builds')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛠️'),
      new ButtonBuilder()
        .setCustomId('dashboard_balance')
        .setLabel(i18nService.t(locale, 'btn_balance') || 'Balance')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚖️'),
      new ButtonBuilder()
        .setCustomId('dashboard_live')
        .setLabel(i18nService.t(locale, 'btn_live') || 'Live')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔎')
    )
  );

  // Row 3: AI & Coaching
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_coach')
        .setLabel(i18nService.t(locale, 'btn_coach') || 'Coach')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🧠'),
      new ButtonBuilder()
        .setCustomId('dashboard_advise')
        .setLabel(i18nService.t(locale, 'btn_advise') || 'Advise')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💡'),
      new ButtonBuilder()
        .setCustomId('dashboard_learn')
        .setLabel(i18nService.t(locale, 'btn_learn') || 'Learn')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📚'),
      new ButtonBuilder()
        .setCustomId('dashboard_awards')
        .setLabel(i18nService.t(locale, 'btn_awards') || 'Awards')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🏆')
    )
  );

  // Row 4: Settings
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_language')
        .setLabel(i18nService.t(locale, 'btn_language') || 'Language')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🌍'),
      new ButtonBuilder()
        .setCustomId('dashboard_help')
        .setLabel(i18nService.t(locale, 'btn_help') || 'Help')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❓'),
      new ButtonBuilder()
        .setCustomId('dashboard_refresh')
        .setLabel(i18nService.t(locale, 'btn_refresh') || 'Refresh')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄')
    )
  );

  return rows;
}
