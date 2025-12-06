/**
 * Menu Builder - Modern Hierarchical Dashboard
 * 
 * v2.3.0: Enterprise-grade menu structure
 * 6 main categories with 5-7 smart submenus each
 * Total: 35+ interactive options
 * 
 * Architecture:
 * - buildMainMenu() → Creates 6 main category buttons
 * - Each category has dedicated submenu builder
 * - Responsive layout (Desktop 2-col, Tablet 2-col, Mobile 1-col)
 * - Full i18n support (PT/EN/ES)
 */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { i18nService } from '../I18nService.js';
import { resolveLocale } from './i18n.js';
import type { Locale } from '../types/dota.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// ============================================================================
// COLOR SCHEME - Psychology Based
// ============================================================================
export const CATEGORY_COLORS = {
  ME: 0x5865F2,        // Discord Blue - Trust, Professional
  IMPROVE: 0x9B59B6,   // Purple - Wisdom, Growth
  MATCH: 0x7289DA,     // Dark Blue - Analysis, Focus
  META: 0x43B581,      // Green - Success, Trending
  TEAM: 0xF26522,      // Orange - Energy, Collaboration
  SETTINGS: 0x72767D,  // Gray - Control, System
};

// ============================================================================
// MAIN MENU BUILDER (6 Categories)
// ============================================================================
export function buildMainMenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  // Row 1: ME, IMPROVE, MATCH (3 buttons)
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('menu_me')
        .setLabel(i18nService.t(locale, 'menu_main_me'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('menu_improve')
        .setLabel(i18nService.t(locale, 'menu_main_improve'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🚀'),
      new ButtonBuilder()
        .setCustomId('menu_match')
        .setLabel(i18nService.t(locale, 'menu_main_match'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊'),
    );
  rows.push(row1);

  // Row 2: META, TEAM, SETTINGS (3 buttons)
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('menu_meta')
        .setLabel(i18nService.t(locale, 'menu_main_meta'))
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎯'),
      new ButtonBuilder()
        .setCustomId('menu_team')
        .setLabel(i18nService.t(locale, 'menu_main_team'))
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚔️'),
      new ButtonBuilder()
        .setCustomId('menu_settings')
        .setLabel(i18nService.t(locale, 'menu_main_settings'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚙️'),
    );
  rows.push(row2);

  return rows;
}

// ============================================================================
// SUBMENU BUILDERS
// ============================================================================

// ME SUBMENU (Account & Stats) - 6 options
export function buildMeSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_me_profile')
        .setLabel(i18nService.t(locale, 'menu_me_profile'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_me_matches')
        .setLabel(i18nService.t(locale, 'menu_me_matches'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_me_heroes')
        .setLabel(i18nService.t(locale, 'menu_me_heroes'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_me_progress')
        .setLabel(i18nService.t(locale, 'menu_me_progress'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_me_connect')
        .setLabel(i18nService.t(locale, 'menu_me_connect'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row2);

  return rows;
}

// IMPROVE SUBMENU (AI Coaching) - 8 options
export function buildImproveSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_improve_performance')
        .setLabel(i18nService.t(locale, 'menu_improve_performance'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_improve_trends')
        .setLabel(i18nService.t(locale, 'menu_improve_trends'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_improve_weaknesses')
        .setLabel(i18nService.t(locale, 'menu_improve_weaknesses'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_improve_strengths')
        .setLabel(i18nService.t(locale, 'menu_improve_strengths'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_improve_heroes')
        .setLabel(i18nService.t(locale, 'menu_improve_heroes'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_improve_compare')
        .setLabel(i18nService.t(locale, 'menu_improve_compare'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row2);

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_improve_report')
        .setLabel(i18nService.t(locale, 'menu_improve_report'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('submenu_improve_tips')
        .setLabel(i18nService.t(locale, 'menu_improve_tips'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row3);

  return rows;
}

// MATCH SUBMENU (Game Analysis) - 7 options
export function buildMatchSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_match_latest')
        .setLabel(i18nService.t(locale, 'menu_match_latest'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_match_history')
        .setLabel(i18nService.t(locale, 'menu_match_history'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_match_search')
        .setLabel(i18nService.t(locale, 'menu_match_search'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_match_benchmarks')
        .setLabel(i18nService.t(locale, 'menu_match_benchmarks'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_match_heatmap')
        .setLabel(i18nService.t(locale, 'menu_match_heatmap'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_match_awards')
        .setLabel(i18nService.t(locale, 'menu_match_awards'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row2);

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_match_imp')
        .setLabel(i18nService.t(locale, 'menu_match_imp'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row3);

  return rows;
}

// META SUBMENU (Heroes & Builds) - 6 options
export function buildMetaSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_meta_carry')
        .setLabel(i18nService.t(locale, 'menu_meta_carry'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('submenu_meta_mid')
        .setLabel(i18nService.t(locale, 'menu_meta_mid'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('submenu_meta_offlane')
        .setLabel(i18nService.t(locale, 'menu_meta_offlane'))
        .setStyle(ButtonStyle.Success),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_meta_support')
        .setLabel(i18nService.t(locale, 'menu_meta_support'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('submenu_meta_build')
        .setLabel(i18nService.t(locale, 'menu_meta_build'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row2);

  return rows;
}

// TEAM SUBMENU (Groups & Draft) - 7 options
export function buildTeamSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_team_balance')
        .setLabel(i18nService.t(locale, 'menu_team_balance'))
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('submenu_team_draft')
        .setLabel(i18nService.t(locale, 'menu_team_draft'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_team_analyzer')
        .setLabel(i18nService.t(locale, 'menu_team_analyzer'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_team_lfg')
        .setLabel(i18nService.t(locale, 'menu_team_lfg'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_team_counters')
        .setLabel(i18nService.t(locale, 'menu_team_counters'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_team_synergy')
        .setLabel(i18nService.t(locale, 'menu_team_synergy'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row2);

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_team_leaderboard')
        .setLabel(i18nService.t(locale, 'menu_team_leaderboard'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row3);

  return rows;
}

// SETTINGS SUBMENU (Preferences & Help) - includes Edit hub
export function buildSettingsSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_settings_language')
        .setLabel(i18nService.t(locale, 'menu_settings_language'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_settings_notifications')
        .setLabel(i18nService.t(locale, 'menu_settings_notifications'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_settings_theme')
        .setLabel(i18nService.t(locale, 'menu_settings_theme'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_settings_about')
        .setLabel(i18nService.t(locale, 'menu_settings_about'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_settings_help')
        .setLabel(i18nService.t(locale, 'menu_settings_help'))
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('submenu_settings_edit')
        .setLabel(i18nService.t(locale, 'menu_settings_edit'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row2);

  const row3 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row3);

  return rows;
}

// ============================================================================
// MAIN MENU EMBED
// ============================================================================
export function buildMainMenuEmbed(locale: Locale, interaction: any): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_main_title'))
    .setDescription(i18nService.t(locale, 'menu_main_description'))
    .setColor(0x5865F2)
    .addFields(
      {
        name: `👤 ${i18nService.t(locale, 'menu_main_me')}`,
        value: i18nService.t(locale, 'menu_main_me_desc'),
        inline: true,
      },
      {
        name: `🚀 ${i18nService.t(locale, 'menu_main_improve')}`,
        value: i18nService.t(locale, 'menu_main_improve_desc'),
        inline: true,
      },
      {
        name: `📊 ${i18nService.t(locale, 'menu_main_match')}`,
        value: i18nService.t(locale, 'menu_main_match_desc'),
        inline: true,
      },
      {
        name: `🎯 ${i18nService.t(locale, 'menu_main_meta')}`,
        value: i18nService.t(locale, 'menu_main_meta_desc'),
        inline: true,
      },
      {
        name: `⚔️ ${i18nService.t(locale, 'menu_main_team')}`,
        value: i18nService.t(locale, 'menu_main_team_desc'),
        inline: true,
      },
      {
        name: `⚙️ ${i18nService.t(locale, 'menu_main_settings')}`,
        value: i18nService.t(locale, 'menu_main_settings_desc'),
        inline: true,
      },
    )
    .setThumbnail(interaction.client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: interaction.client.user?.displayAvatarURL() || '',
    });

  return embed;
}

// ============================================================================
// CATEGORY-SPECIFIC EMBEDS
// ============================================================================
export function buildMeEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_me_title'))
    .setDescription(i18nService.t(locale, 'menu_me_description'))
    .setColor(CATEGORY_COLORS.ME)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_me_profile'),
        value: i18nService.t(locale, 'menu_me_profile_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_me_matches'),
        value: i18nService.t(locale, 'menu_me_matches_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_me_heroes'),
        value: i18nService.t(locale, 'menu_me_heroes_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_me_progress'),
        value: i18nService.t(locale, 'menu_me_progress_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_me_connect'),
        value: i18nService.t(locale, 'menu_me_connect_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

export function buildImproveEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_improve_title'))
    .setDescription(i18nService.t(locale, 'menu_improve_description'))
    .setColor(CATEGORY_COLORS.IMPROVE)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_improve_performance'),
        value: i18nService.t(locale, 'menu_improve_performance_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_trends'),
        value: i18nService.t(locale, 'menu_improve_trends_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_weaknesses'),
        value: i18nService.t(locale, 'menu_improve_weaknesses_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_strengths'),
        value: i18nService.t(locale, 'menu_improve_strengths_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_heroes'),
        value: i18nService.t(locale, 'menu_improve_heroes_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_compare'),
        value: i18nService.t(locale, 'menu_improve_compare_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_report'),
        value: i18nService.t(locale, 'menu_improve_report_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_improve_tips'),
        value: i18nService.t(locale, 'menu_improve_tips_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

export function buildMatchEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_match_title'))
    .setDescription(i18nService.t(locale, 'menu_match_description'))
    .setColor(CATEGORY_COLORS.MATCH)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_match_latest'),
        value: i18nService.t(locale, 'menu_match_latest_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_history'),
        value: i18nService.t(locale, 'menu_match_history_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_search'),
        value: i18nService.t(locale, 'menu_match_search_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_benchmarks'),
        value: i18nService.t(locale, 'menu_match_benchmarks_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_heatmap'),
        value: i18nService.t(locale, 'menu_match_heatmap_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_awards'),
        value: i18nService.t(locale, 'menu_match_awards_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_match_imp'),
        value: i18nService.t(locale, 'menu_match_imp_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

export function buildMetaEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_meta_title'))
    .setDescription(i18nService.t(locale, 'menu_meta_description'))
    .setColor(CATEGORY_COLORS.META)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_meta_carry'),
        value: i18nService.t(locale, 'menu_meta_carry_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_meta_mid'),
        value: i18nService.t(locale, 'menu_meta_mid_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_meta_offlane'),
        value: i18nService.t(locale, 'menu_meta_offlane_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_meta_support'),
        value: i18nService.t(locale, 'menu_meta_support_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_meta_build'),
        value: i18nService.t(locale, 'menu_meta_build_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

export function buildTeamEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_team_title'))
    .setDescription(i18nService.t(locale, 'menu_team_description'))
    .setColor(CATEGORY_COLORS.TEAM)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_team_balance'),
        value: i18nService.t(locale, 'menu_team_balance_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_draft'),
        value: i18nService.t(locale, 'menu_team_draft_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_analyzer'),
        value: i18nService.t(locale, 'menu_team_analyzer_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_lfg'),
        value: i18nService.t(locale, 'menu_team_lfg_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_counters'),
        value: i18nService.t(locale, 'menu_team_counters_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_synergy'),
        value: i18nService.t(locale, 'menu_team_synergy_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_team_leaderboard'),
        value: i18nService.t(locale, 'menu_team_leaderboard_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

export function buildSettingsEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_settings_title'))
    .setDescription(i18nService.t(locale, 'menu_settings_description'))
    .setColor(CATEGORY_COLORS.SETTINGS)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_settings_language'),
        value: i18nService.t(locale, 'menu_settings_language_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_settings_notifications'),
        value: i18nService.t(locale, 'menu_settings_notifications_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_settings_theme'),
        value: i18nService.t(locale, 'menu_settings_theme_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_settings_about'),
        value: i18nService.t(locale, 'menu_settings_about_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_settings_help'),
        value: i18nService.t(locale, 'menu_settings_help_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_settings_edit'),
        value: i18nService.t(locale, 'menu_settings_edit_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}

// EDIT SUBMENU (all editable preferences without typing)
export function buildEditSubmenu(locale: Locale): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_edit_profile')
        .setLabel(i18nService.t(locale, 'menu_edit_profile'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_edit_language')
        .setLabel(i18nService.t(locale, 'menu_edit_language'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_edit_notifications')
        .setLabel(i18nService.t(locale, 'menu_edit_notifications'))
        .setStyle(ButtonStyle.Primary),
    );
  rows.push(row1);

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('submenu_edit_privacy')
        .setLabel(i18nService.t(locale, 'menu_edit_privacy'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('submenu_edit_builds')
        .setLabel(i18nService.t(locale, 'menu_edit_builds'))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('menu_back')
        .setLabel(i18nService.t(locale, 'btn_back'))
        .setStyle(ButtonStyle.Secondary),
    );
  rows.push(row2);

  return rows;
}

export function buildEditEmbedSubmenu(locale: Locale, client: any): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(i18nService.t(locale, 'menu_edit_title'))
    .setDescription(i18nService.t(locale, 'menu_edit_description'))
    .setColor(CATEGORY_COLORS.SETTINGS)
    .addFields(
      {
        name: i18nService.t(locale, 'menu_edit_profile'),
        value: i18nService.t(locale, 'menu_edit_profile_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_edit_language'),
        value: i18nService.t(locale, 'menu_edit_language_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_edit_notifications'),
        value: i18nService.t(locale, 'menu_edit_notifications_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_edit_privacy'),
        value: i18nService.t(locale, 'menu_edit_privacy_desc'),
        inline: true,
      },
      {
        name: i18nService.t(locale, 'menu_edit_builds'),
        value: i18nService.t(locale, 'menu_edit_builds_desc'),
        inline: true,
      },
    )
    .setThumbnail(client.user?.displayAvatarURL() || '')
    .setFooter({
      text: i18nService.t(locale, 'menu_footer'),
      iconURL: client.user?.displayAvatarURL() || '',
    });
}
