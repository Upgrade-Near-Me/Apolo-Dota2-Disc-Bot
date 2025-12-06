/**
 * Menu Handler - Manages all menu navigation
 * 
 * Routes button clicks to correct submenus
 * Handles back button logic
 * Manages state between main menu and submenus
 */

import { ButtonInteraction } from 'discord.js';
import { resolveLocale } from '../utils/i18n.js';
import {
  buildMainMenu,
  buildMeSubmenu,
  buildImproveSubmenu,
  buildMatchSubmenu,
  buildMetaSubmenu,
  buildTeamSubmenu,
  buildSettingsSubmenu,
  buildMainMenuEmbed,
  buildMeEmbedSubmenu,
  buildImproveEmbedSubmenu,
  buildMatchEmbedSubmenu,
  buildMetaEmbedSubmenu,
  buildTeamEmbedSubmenu,
  buildSettingsEmbedSubmenu,
} from '../utils/menuBuilder.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function handleMenuButton(interaction: ButtonInteraction): Promise<void> {
  const locale = await resolveLocale(interaction);
  const customId = interaction.customId;

  try {
    await interaction.deferUpdate();

    // ====================== MAIN MENU ======================
    if (customId === 'menu_back') {
      // Go back to main menu
      const embed = buildMainMenuEmbed(locale, interaction);
      const buttons = buildMainMenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== ME CATEGORY ======================
    else if (customId === 'menu_me') {
      const embed = buildMeEmbedSubmenu(locale, interaction.client);
      const buttons = buildMeSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== IMPROVE CATEGORY ======================
    else if (customId === 'menu_improve') {
      const embed = buildImproveEmbedSubmenu(locale, interaction.client);
      const buttons = buildImproveSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== MATCH CATEGORY ======================
    else if (customId === 'menu_match') {
      const embed = buildMatchEmbedSubmenu(locale, interaction.client);
      const buttons = buildMatchSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== META CATEGORY ======================
    else if (customId === 'menu_meta') {
      const embed = buildMetaEmbedSubmenu(locale, interaction.client);
      const buttons = buildMetaSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== TEAM CATEGORY ======================
    else if (customId === 'menu_team') {
      const embed = buildTeamEmbedSubmenu(locale, interaction.client);
      const buttons = buildTeamSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // ====================== SETTINGS CATEGORY ======================
    else if (customId === 'menu_settings') {
      const embed = buildSettingsEmbedSubmenu(locale, interaction.client);
      const buttons = buildSettingsSubmenu(locale);

      await interaction.editReply({
        embeds: [embed],
        components: buttons,
      });
    }
    // If none of the above, do nothing (will be handled by other handlers)
  } catch (error) {
    console.error('Error in menu handler:', error);
    await interaction.editReply({
      content: 'Error navigating menu. Please try again.',
      components: [],
    });
  }
}
