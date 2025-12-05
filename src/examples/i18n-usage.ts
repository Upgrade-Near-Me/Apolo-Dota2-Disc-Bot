/**
 * INTEGRATION EXAMPLE: Using I18nService in Discord Commands
 * 
 * This example demonstrates how to use the I18nService for internationalization
 * in Discord.js commands with TypeScript.
 */

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { i18nService } from '../I18nService.js';
import type { Command } from '../types/dota.js';

/**
 * Example: Dashboard Command with I18n
 */
const dashboardCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Open the APOLO Dota 2 control panel'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // STEP 1: Get user's locale with priority chain
      // Priority: guild_settings → interaction.locale → 'en'
      const locale = await i18nService.getLocale(interaction);

      // STEP 2: Translate strings using the resolved locale
      const embedTitle = i18nService.t(locale, 'embed_title');
      const embedDescription = i18nService.t(locale, 'embed_description');
      const embedFooter = i18nService.t(locale, 'embed_footer');

      // STEP 3: Create embed with translated content
      const embed = new EmbedBuilder()
        .setColor('#FF6B35')
        .setTitle(embedTitle)
        .setDescription(embedDescription)
        .setFooter({ text: embedFooter })
        .setTimestamp();

      // STEP 4: Create buttons with translated labels
      const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('dashboard_connect')
            .setLabel(i18nService.t(locale, 'btn_connect'))
            .setStyle(ButtonStyle.Primary),
          
          new ButtonBuilder()
            .setCustomId('dashboard_match')
            .setLabel(i18nService.t(locale, 'btn_match'))
            .setStyle(ButtonStyle.Primary),
          
          new ButtonBuilder()
            .setCustomId('dashboard_profile')
            .setLabel(i18nService.t(locale, 'btn_profile'))
            .setStyle(ButtonStyle.Primary)
        );

      const row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('dashboard_balance')
            .setLabel(i18nService.t(locale, 'btn_balance'))
            .setStyle(ButtonStyle.Secondary),
          
          new ButtonBuilder()
            .setCustomId('dashboard_ai_coach')
            .setLabel(i18nService.t(locale, 'btn_ai_coach'))
            .setStyle(ButtonStyle.Success),
          
          new ButtonBuilder()
            .setCustomId('dashboard_help')
            .setLabel(i18nService.t(locale, 'btn_help'))
            .setStyle(ButtonStyle.Secondary)
        );

      // STEP 5: Reply with localized content
      await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
        ephemeral: true
      });

    } catch (error) {
      console.error('Dashboard command error:', error);
      
      // Error handling with i18n
      const locale = await i18nService.getLocale(interaction);
      await interaction.reply({
        content: i18nService.t(locale, 'error_generic'),
        ephemeral: true
      });
    }
  }
};

/**
 * Example: Button Handler with Parameter Replacement
 */
async function handleConnectButton(interaction: ChatInputCommandInteraction) {
  const locale = await i18nService.getLocale(interaction);
  
  // Use parameter replacement for personalized messages
  const greeting = i18nService.t(locale, 'welcome_user', {
    username: interaction.user.username
  });

  await interaction.reply({
    content: greeting,
    ephemeral: true
  });
}

/**
 * Example: Error Handling with I18n
 */
async function handleMatchAnalysis(interaction: ChatInputCommandInteraction, steamId: string | null) {
  const locale = await i18nService.getLocale(interaction);

  // Check if user has linked Steam account
  if (!steamId) {
    await interaction.reply({
      content: i18nService.t(locale, 'error_no_steam'),
      ephemeral: true
    });
    return;
  }

  try {
    // Fetch match data (simulated)
    await interaction.deferReply({ ephemeral: true });
    
    // Show loading message
    await interaction.editReply({
      content: i18nService.t(locale, 'match_loading')
    });

    // ... match analysis logic ...

  } catch (error) {
    // Handle different error types with appropriate messages
    if ((error as Error).message.includes('private')) {
      await interaction.editReply({
        content: i18nService.t(locale, 'error_private_profile')
      });
    } else if ((error as Error).message.includes('429')) {
      await interaction.editReply({
        content: i18nService.t(locale, 'error_api_unavailable')
      });
    } else {
      await interaction.editReply({
        content: i18nService.t(locale, 'error_generic')
      });
    }
  }
}

/**
 * Example: Complex Parameter Replacement
 */
async function showPlayerRank(interaction: ChatInputCommandInteraction) {
  const locale = await i18nService.getLocale(interaction);

  // Simulate player data
  const playerData = {
    rank: 'Ancient V',
    mmr: 4250
  };

  // Multiple parameter replacement
  const rankMessage = i18nService.t(locale, 'rank_info', {
    rank: playerData.rank,
    mmr: playerData.mmr
  });

  await interaction.reply({
    content: rankMessage,
    ephemeral: true
  });
}

/**
 * Example: Language Change Command
 * 
 * When guild settings are updated, clear the cache
 */
async function handleLanguageChange(interaction: ChatInputCommandInteraction, newLocale: 'en' | 'pt' | 'es') {
  const guildId = interaction.guild?.id;
  if (!guildId) return;

  try {
    // Import pool dynamically (since it's a .js file)
    const { default: pool } = await import('../database/index.js') as { default: any };
    
    // Update database
    await pool.query(
      `INSERT INTO guild_settings (guild_id, locale, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (guild_id) DO UPDATE SET locale = $2, updated_at = NOW()`,
      [guildId, newLocale]
    );

    // IMPORTANT: Clear cache after update
    i18nService.clearGuildCache(guildId);

    // Confirm with new language
    const successMessage = i18nService.t(newLocale, 'connect_success');
    await interaction.reply({
      content: `✅ ${successMessage}`,
      ephemeral: true
    });

  } catch (error) {
    console.error('Language change error:', error);
    const locale = await i18nService.getLocale(interaction);
    await interaction.reply({
      content: i18nService.t(locale, 'error_generic'),
      ephemeral: true
    });
  }
}

export { 
  dashboardCommand, 
  handleConnectButton, 
  handleMatchAnalysis, 
  showPlayerRank,
  handleLanguageChange 
};
