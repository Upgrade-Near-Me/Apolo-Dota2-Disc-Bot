/**
 * Advanced Button Handlers for Dashboard
 * Implements drill-down, comparison, and detailed analysis features
 * Enhances user interaction depth and engagement
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import type { Locale } from '../types/dota.d.js';

/**
 * Create drill-down buttons for stats analysis
 * Allows users to dive deeper into specific statistics
 */
export function createDrillDownButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_details`)
      .setLabel('📊 Details')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_compare`)
      .setLabel('⚖️ Compare')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_history`)
      .setLabel('📈 History')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_export`)
      .setLabel('💾 Export')
      .setStyle(ButtonStyle.Secondary)
  );
}

/**
 * Create comparison mode buttons
 * Compare player/hero stats to bracket average or other players
 */
export function createComparisonButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_vs_avg`)
      .setLabel('vs Average')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_vs_pro`)
      .setLabel('vs Pro Players')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_vs_friend`)
      .setLabel('vs Teammate')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_back`)
      .setLabel('← Back')
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * Create time range selector for historical analysis
 * Allows filtering stats by time period
 */
export function createTimeRangeButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_week`)
      .setLabel('7 Days')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_month`)
      .setLabel('30 Days')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_season`)
      .setLabel('This Season')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_alltime`)
      .setLabel('All Time')
      .setStyle(ButtonStyle.Secondary)
  );
}

/**
 * Create hero selection menu for detailed analysis
 * Shows top 10 heroes for detailed drill-down
 */
export function createHeroSelectionMenu(
  locale: Locale,
  heroes: Array<{ id: string; name: string; games: number }>,
  baseId: string
): ActionRowBuilder {
  const options = heroes.slice(0, 25).map((hero) => ({
    label: hero.name,
    value: `${baseId}_hero_${hero.id}`,
    description: `${hero.games} games`,
  }));

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`${baseId}_hero_select`)
      .setPlaceholder('Select a hero to analyze')
      .addOptions(options)
  );
}

/**
 * Create analysis depth buttons
 * Quick, detailed, or comprehensive analysis options
 */
export function createAnalysisDepthButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_quick`)
      .setLabel('⚡ Quick')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('⚡'),
    new ButtonBuilder()
      .setCustomId(`${baseId}_detailed`)
      .setLabel('📊 Detailed')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📊'),
    new ButtonBuilder()
      .setCustomId(`${baseId}_comprehensive`)
      .setLabel('🔍 Comprehensive')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🔍'),
    new ButtonBuilder()
      .setCustomId(`${baseId}_ai`)
      .setLabel('🤖 AI Analysis')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🤖')
  );
}

/**
 * Create metric selection buttons
 * Choose which stats to visualize
 */
export function createMetricSelectionButtons(
  locale: Locale,
  baseId: string
): ActionRowBuilder[] {
  const rows: ActionRowBuilder[] = [];

  // Row 1: Core metrics
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${baseId}_gpm`)
        .setLabel('💰 GPM')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_xpm`)
        .setLabel('📈 XPM')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_kda`)
        .setLabel('⚔️ KDA')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_wr`)
        .setLabel('🎯 Win Rate')
        .setStyle(ButtonStyle.Primary)
    )
  );

  // Row 2: Advanced metrics
  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${baseId}_cs`)
        .setLabel('🎮 CS')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_nw`)
        .setLabel('💎 Net Worth')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_hero_dmg`)
        .setLabel('🔥 Hero Dmg')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`${baseId}_support`)
        .setLabel('💊 Support')
        .setStyle(ButtonStyle.Secondary)
    )
  );

  return rows;
}

/**
 * Create interaction feedback button
 * Quick feedback without leaving chat
 */
export function createFeedbackButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_helpful`)
      .setLabel('👍 Helpful')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${baseId}_neutral`)
      .setLabel('👌 Neutral')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_unhelpful`)
      .setLabel('👎 Unhelpful')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`${baseId}_report`)
      .setLabel('⚠️ Report')
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * Create pagination buttons for large result sets
 */
export function createPaginationButtons(
  locale: Locale,
  baseId: string,
  currentPage: number,
  totalPages: number
): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_first`)
      .setLabel('⏮️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId(`${baseId}_prev`)
      .setLabel('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId(`${baseId}_page`)
      .setLabel(`${currentPage}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${baseId}_next`)
      .setLabel('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === totalPages),
    new ButtonBuilder()
      .setCustomId(`${baseId}_last`)
      .setLabel('⏭️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === totalPages)
  );
}

/**
 * Create action buttons for detailed views
 * Perform actions on displayed data
 */
export function createActionButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_share`)
      .setLabel('📤 Share')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_save`)
      .setLabel('💾 Save')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_download`)
      .setLabel('⬇️ Download')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_close`)
      .setLabel('❌ Close')
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * Create role-based filter buttons
 */
export function createRoleFilterButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_carry`)
      .setLabel('🛡️ Carry')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_mid`)
      .setLabel('⚔️ Mid')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_offlane`)
      .setLabel('🏃 Off')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_support`)
      .setLabel('💊 Sup')
      .setStyle(ButtonStyle.Primary)
  );
}

/**
 * Create sort option buttons
 */
export function createSortButtons(locale: Locale, baseId: string): ActionRowBuilder {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${baseId}_sort_wr`)
      .setLabel('Win Rate ↑')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_sort_games`)
      .setLabel('Games ↑')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_sort_recent`)
      .setLabel('Recent ↓')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${baseId}_sort_gpm`)
      .setLabel('GPM ↓')
      .setStyle(ButtonStyle.Secondary)
  );
}

export default {
  createDrillDownButtons,
  createComparisonButtons,
  createTimeRangeButtons,
  createHeroSelectionMenu,
  createAnalysisDepthButtons,
  createMetricSelectionButtons,
  createFeedbackButtons,
  createPaginationButtons,
  createActionButtons,
  createRoleFilterButtons,
  createSortButtons,
};
