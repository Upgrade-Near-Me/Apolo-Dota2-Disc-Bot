/**
 * Dashboard Command - TypeScript with I18n Integration
 * 
 * Main interactive control panel for APOLO Dota 2 Bot
 * Features: User-aware i18n, Steam connection, statistics, AI coaching
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction
} from 'discord.js';
import { resolveLocale } from '../utils/i18n.js';
import { i18nService } from '../I18nService.js';
import type { Command } from '../types/dota.js';
import type { Pool } from 'pg';

// Import JavaScript modules dynamically to avoid TypeScript errors
let pool: Pool;
let openDota: any;
let dmOrEphemeral: any;
let buttonHandler: any;
let initialized = false;

// Dynamic imports
async function initializeDependencies() {
  if (initialized) return;
  
  pool = (await import('../database/index.js')).default;
  buttonHandler = await import('../handlers/buttonHandler.js');
  openDota = await import('../services/openDotaService.js');
  dmOrEphemeral = (await import('../utils/dm.js')).dmOrEphemeral;
  
  initialized = true;
}

const dashboardCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('🎮 Open APOLO Dota 2 interactive dashboard')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Initialize dependencies first
    await initializeDependencies();
    
    // Check if user has Administrator permission
    const memberPermissions = interaction.member?.permissions;
    if (memberPermissions && typeof memberPermissions !== 'string' && !memberPermissions.has(PermissionFlagsBits.Administrator)) {
      const locale = await resolveLocale(interaction);
      await interaction.reply({
        content: i18nService.t(locale, 'error_generic'),
        ephemeral: true,
      });
      return;
    }
    
    // Get user's locale with priority chain
    const locale = await resolveLocale(interaction);
    
    // ===== MODERN ENTERPRISE DASHBOARD 2024/2025 =====
    // Cyberpunk Aesthetic with Clear Visual Hierarchy
    const embed = new EmbedBuilder()
      .setColor('#00d9ff') // Cyan Premium (Midjourney/MEE6 style)
      .setTitle('🎮 APOLO COMMAND CENTER')
      .setDescription('**Painel de Controle Tático • Selecione um módulo abaixo**\n\n*Sistema de análise avançada com IA Gemini integrada*')
      .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png')
      .addFields(
        { name: '👤 Player Stats', value: 'Perfil, Partidas e Histórico', inline: true },
        { name: '🤖 AI Intelligence', value: 'Coach Gemini & Análise', inline: true },
        { name: '⚙️ Server Tools', value: 'Configurações e Utilitários', inline: true },
      )
      .setImage('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/blog/733_update_main.jpg')
      .setFooter({ 
        text: 'APOLO Dota 2 • v2.0 Enterprise Edition', 
        iconURL: interaction.client.user?.displayAvatarURL() 
      })
      .setTimestamp();

    // ROW 1: Primary Actions (Account & Status)
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_connect')
        .setLabel(i18nService.t(locale, 'btn_connect'))
        .setStyle(ButtonStyle.Success) // Green = Entry Point
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setCustomId('dashboard_profile')
        .setLabel(i18nService.t(locale, 'btn_profile'))
        .setStyle(ButtonStyle.Primary) // Blue = Main Feature
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId('dashboard_match')
        .setLabel(i18nService.t(locale, 'btn_match'))
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    );

    // ROW 2: Intelligence & Evolution (Premium Features)
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_ai')
        .setLabel(i18nService.t(locale, 'btn_ai_coach'))
        .setStyle(ButtonStyle.Primary) // Premium Blue
        .setEmoji('🤖'),
      new ButtonBuilder()
        .setCustomId('dashboard_progress')
        .setLabel(i18nService.t(locale, 'btn_progress'))
        .setStyle(ButtonStyle.Secondary) // Gray = Analytics
        .setEmoji('📈'),
      new ButtonBuilder()
        .setCustomId('dashboard_leaderboard')
        .setLabel(i18nService.t(locale, 'btn_leaderboard'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏆')
    );

    // ROW 3: Tactical Tools
    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_balance')
        .setLabel(i18nService.t(locale, 'btn_balance'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚖️'),
      new ButtonBuilder()
        .setCustomId('dashboard_meta')
        .setLabel(i18nService.t(locale, 'btn_meta'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚔️'),
      new ButtonBuilder()
        .setCustomId('dashboard_heatmap')
        .setLabel(i18nService.t(locale, 'btn_heatmap'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🗺️'),
      new ButtonBuilder()
        .setCustomId('dashboard_builds')
        .setLabel(i18nService.t(locale, 'btn_build'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛠️')
    );

    // ROW 4: System & Configuration
    const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_language')
        .setLabel(i18nService.t(locale, 'btn_language') || 'Idioma')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🌍'),
      new ButtonBuilder()
        .setCustomId('dashboard_help')
        .setLabel(i18nService.t(locale, 'btn_help'))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❓'),
      new ButtonBuilder()
        .setCustomId('dashboard_refresh')
        .setLabel(i18nService.t(locale, 'btn_refresh') || 'Atualizar')
        .setStyle(ButtonStyle.Danger) // Red = Refresh/Reset
        .setEmoji('🔄')
    );

    await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3, row4],
      ephemeral: true,
    });
  },

  async handleButton(interaction: ButtonInteraction) {
    // Initialize dependencies first
    await initializeDependencies();
    
    const buttonId = interaction.customId;
    
    // Get user's locale for all responses
    const locale = await resolveLocale(interaction);

    // Refresh dashboard
    if (buttonId === 'dashboard_refresh') {
      // @ts-expect-error - Casting to ChatInputCommandInteraction for execute
      await this.execute(interaction as ChatInputCommandInteraction);
      return;
    }

    // Connect Steam - Show modal for Steam ID input
    if (buttonId === 'dashboard_connect') {
      const modal = new ModalBuilder()
        .setCustomId('connect_steam_modal')
        .setTitle(i18nService.t(locale, 'connect_modal_title'));

      const steamIdInput = new TextInputBuilder()
        .setCustomId('steam_id_input')
        .setLabel(i18nService.t(locale, 'connect_modal_label'))
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('76561198075697090 or https://steamcommunity.com/id/...')
        .setRequired(true)
        .setMinLength(5)
        .setMaxLength(100);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(steamIdInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // Language Selection
    if (buttonId === 'dashboard_language') {
      const languageEmbed = new EmbedBuilder()
        .setColor('#00d9ff')
        .setTitle('🌍 ' + (i18nService.t(locale, 'language_title') || 'Selecionar Idioma'))
        .setDescription(i18nService.t(locale, 'language_description') || 'Escolha o idioma do bot para este servidor:');

      const languageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('language_en')
          .setLabel('🇺🇸 English')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('language_pt')
          .setLabel('🇧🇷 Português')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('language_es')
          .setLabel('🇪🇸 Español')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        embeds: [languageEmbed],
        components: [languageRow],
        ephemeral: true,
      });
      return;
    }

    // Language selection handlers
    if (buttonId.startsWith('language_')) {
      const selectedLocale = buttonId.replace('language_', '') as import('../types/dota.js').Locale;
      
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Update guild locale in database
        await pool.query(
          `INSERT INTO guild_settings (guild_id, locale, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (guild_id) DO UPDATE SET locale = $2, updated_at = NOW()`,
          [interaction.guild?.id, selectedLocale]
        );

        await interaction.editReply({
          content: i18nService.t(selectedLocale, 'language_success') || '✅ Idioma atualizado com sucesso!',
        });
      } catch (error) {
        console.error('Error updating language:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic') || '❌ Erro ao atualizar idioma.',
        });
      }
      return;
    }

    // Help
    if (buttonId === 'dashboard_help') {
      const helpEmbed = new EmbedBuilder()
        .setColor('#1e88e5')
        .setTitle(i18nService.t(locale, 'embed_title'))
        .setDescription(i18nService.t(locale, 'embed_description'))
        .setFooter({ text: i18nService.t(locale, 'embed_footer') });
      
      await interaction.deferReply({ ephemeral: true });
      await dmOrEphemeral(interaction, { embeds: [helpEmbed] });
      return;
    }

    // Profile
    if (buttonId === 'dashboard_profile') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Get Steam ID from database
        const userResult = await pool.query<{ steam_id: string; username: string }>(
          'SELECT steam_id, username FROM users WHERE discord_id = $1',
          [interaction.user.id]
        );

        if (userResult.rows.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }

        const userRow = userResult.rows[0];
        if (!userRow) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }
        
        const { steam_id, username } = userRow;
        const steam32Id = parseInt(steam_id);

        // Fetch profile from OpenDota
        const profile = await openDota.getPlayerProfile(steam32Id);
        
        if (!profile) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_api_unavailable'),
          });
          return;
        }

        // Create profile embed with translations
        const profileEmbed = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle(`${i18nService.t(locale, 'profile_title')} ${profile.name || username || 'Unknown Player'}`)
          .setDescription(`*${i18nService.t(locale, 'profile_title')}*`)
          .setThumbnail(profile.avatar || null)
          .addFields(
            { 
              name: i18nService.t(locale, 'profile_matches'), 
              value: `${profile.totalMatches}`, 
              inline: true 
            },
            { 
              name: '✅ Wins', 
              value: `${profile.wins}`, 
              inline: true 
            },
            { 
              name: '❌ Losses', 
              value: `${profile.losses}`, 
              inline: true 
            },
            { 
              name: i18nService.t(locale, 'profile_winrate'), 
              value: `${profile.winRate}%`, 
              inline: true 
            },
            { 
              name: i18nService.t(locale, 'profile_rank'), 
              value: profile.rank || 'Unranked', 
              inline: true 
            },
            { 
              name: '\u200b', 
              value: '\u200b', 
              inline: true 
            }
          )
          .setFooter({ text: `Steam ID: ${steam32Id} • Data from OpenDota` })
          .setTimestamp();

        // Add top heroes if available
        if (profile.topHeroes && profile.topHeroes.length > 0) {
          const heroesText = profile.topHeroes
            .map((h: any, i: number) => `${i + 1}. ${h.name} (${h.games} games - ${h.winRate}% WR)`)
            .join('\n');
          profileEmbed.addFields({ name: '🏆 Top Heroes', value: heroesText });
        }

        await dmOrEphemeral(interaction, { embeds: [profileEmbed] });
      } catch (error) {
        console.error('Error loading profile:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
      return;
    }

    // Match
    if (buttonId === 'dashboard_match') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Get Steam ID from database
        const userResult = await pool.query<{ steam_id: string }>(
          'SELECT steam_id FROM users WHERE discord_id = $1',
          [interaction.user.id]
        );

        if (userResult.rows.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }

        const userRowMatch = userResult.rows[0];
        if (!userRowMatch) {
          await interaction.editReply({ content: i18nService.t(locale, 'error_no_steam') });
          return;
        }
        const steam32Id = parseInt(userRowMatch.steam_id);

        // Show loading message with translation
        await interaction.editReply({
          content: i18nService.t(locale, 'match_loading'),
        });

        // Fetch last match from OpenDota
        const match = await openDota.getLastMatch(steam32Id);
        
        if (!match) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_generic'),
          });
          return;
        }

        // Create match embed with translations
        const result = match.result === 'WIN' 
          ? `✅ ${i18nService.t(locale, 'match_victory')}` 
          : `❌ ${i18nService.t(locale, 'match_defeat')}`;
        const color = match.result === 'WIN' ? '#2ecc71' : '#e74c3c';
        const kda = ((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2);
        const duration = `${Math.floor(match.duration / 60)}:${String(match.duration % 60).padStart(2, '0')}`;

        const matchEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle(`${result} - ${match.heroName}`)
          .setDescription(`*Last match performance • ${i18nService.t(locale, 'match_duration')}: ${duration}*`)
          .addFields(
            { name: '⚔️ K/D/A', value: `${match.kills}/${match.deaths}/${match.assists}`, inline: true },
            { name: '📊 KDA Ratio', value: kda, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '💰 GPM', value: `${match.gpm}`, inline: true },
            { name: '📈 XPM', value: `${match.xpm}`, inline: true },
            { name: '💎 Net Worth', value: `${match.netWorth.toLocaleString()}`, inline: true }
          )
          .setFooter({ text: `Match ID: ${match.matchId} • Data from OpenDota` })
          .setTimestamp(match.playedAt);

        await dmOrEphemeral(interaction, { embeds: [matchEmbed] });
      } catch (error) {
        console.error('Error loading match:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
      return;
    }

    // Match History
    if (buttonId === 'dashboard_match_history') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Get Steam ID from database
        const userResult = await pool.query<{ steam_id: string }>(
          'SELECT steam_id FROM users WHERE discord_id = $1',
          [interaction.user.id]
        );

        if (userResult.rows.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }

        const userRowHistory = userResult.rows[0];
        if (!userRowHistory) {
          await interaction.editReply({ content: i18nService.t(locale, 'error_no_steam') });
          return;
        }
        const steam32Id = parseInt(userRowHistory.steam_id);

        // Fetch last 10 matches from OpenDota
        const matches = await openDota.getMatchHistory(steam32Id, 10);
        
        if (!matches || matches.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_generic'),
          });
          return;
        }

        // Create match history embed
        const historyEmbed = new EmbedBuilder()
          .setColor('#3498db')
          .setTitle('📜 Histórico de Partidas Recentes')
          .setDescription(`*Últimas ${matches.length} partidas analisadas*`)
          .setFooter({ text: 'Data from OpenDota' })
          .setTimestamp();

        // Add each match as a field
        matches.forEach((match: any, index: number) => {
          const result = match.won ? '✅' : '❌';
          const kda = ((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2);
          const duration = `${Math.floor(match.duration / 60)}:${String(match.duration % 60).padStart(2, '0')}`;
          
          historyEmbed.addFields({
            name: `${index + 1}. ${result} ${match.heroName || 'Hero'}`,
            value: `⚔️ ${match.kills}/${match.deaths}/${match.assists} (KDA: ${kda}) | ⏱️ ${duration} | 💰 ${match.gpm} GPM`,
            inline: false
          });
        });

        await dmOrEphemeral(interaction, { embeds: [historyEmbed] });
      } catch (error) {
        console.error('Error loading match history:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
      return;
    }

    // Progress
    if (buttonId === 'dashboard_progress') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Get Steam ID from database
        const userResult = await pool.query<{ steam_id: string }>(
          'SELECT steam_id FROM users WHERE discord_id = $1',
          [interaction.user.id]
        );

        if (userResult.rows.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }

        const userRowProgress = userResult.rows[0];
        if (!userRowProgress) {
          await interaction.editReply({ content: i18nService.t(locale, 'error_no_steam') });
          return;
        }
        const steam32Id = parseInt(userRowProgress.steam_id);

        // Fetch match history from OpenDota
        const matches = await openDota.getMatchHistory(steam32Id, 20);
        
        if (!matches || matches.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_generic'),
          });
          return;
        }

        // Calculate statistics
        const wins = matches.filter((m: any) => Boolean(m.won)).length;
        const winRate = ((wins / matches.length) * 100).toFixed(1);
        const avgGPM = (matches.reduce((sum: number, m: any) => sum + Number(m.gpm || 0), 0) / matches.length).toFixed(0);
        const avgXPM = (matches.reduce((sum: number, m: any) => sum + Number(m.xpm || 0), 0) / matches.length).toFixed(0);

        // Find highest stats
        const bestGPM = Math.max(...matches.map((m: any) => Number(m.gpm || 0)));
        const bestXPM = Math.max(...matches.map((m: any) => Number(m.xpm || 0)));

        // Create progress embed
        const progressEmbed = new EmbedBuilder()
          .setColor('#9b59b6')
          .setTitle('📈 Progress Tracker')
          .setDescription('*Performance analysis of your last 20 matches*')
          .addFields(
            { name: '🎮 Matches Analyzed', value: `${matches.length}`, inline: true },
            { name: `✅ ${i18nService.t(locale, 'profile_winrate')}`, value: `${winRate}%`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '💰 Average GPM', value: avgGPM, inline: true },
            { name: '📈 Average XPM', value: avgXPM, inline: true },
            { name: '\u200b', value: '\u200b', inline: true },
            { name: '🏆 Best GPM', value: `${bestGPM}`, inline: true },
            { name: '🏆 Best XPM', value: `${bestXPM}`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }
          )
          .setFooter({ text: 'Keep playing to track your evolution! • Data from OpenDota' })
          .setTimestamp();

        // Add recent trend (last 5 matches)
        const recentWins = matches.slice(0, 5).filter((m: any) => Boolean(m.won)).length;
        const trendEmoji = recentWins >= 3 ? '📈' : recentWins >= 2 ? '➡️' : '📉';
        progressEmbed.addFields({
          name: `${trendEmoji} Recent Form (Last 5)`,
          value: `${recentWins} wins, ${5 - recentWins} losses`
        });

        await dmOrEphemeral(interaction, { embeds: [progressEmbed] });
      } catch (error) {
        console.error('Error loading progress:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
      return;
    }

    // Leaderboard
    if (buttonId === 'dashboard_leaderboard') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const guildId = interaction.guild?.id;
        if (!guildId) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_generic'),
          });
          return;
        }

        // Get top 10 players from this server
        interface LeaderboardRow {
          discord_id: string;
          username: string;
          matches_played: number;
          matches_won: number;
          matches_lost: number;
          win_rate: number;
        }

        const leaderboardResult = await pool.query<LeaderboardRow>(`
          SELECT u.discord_id, u.username, 
                 s.matches_played, s.matches_won, 
                 (s.matches_played - s.matches_won) as matches_lost,
                 ROUND((s.matches_won::decimal / NULLIF(s.matches_played, 0)) * 100, 1) as win_rate
          FROM server_stats s
          JOIN users u ON s.discord_id = u.discord_id
          WHERE s.guild_id = $1 AND s.matches_played >= 5
          ORDER BY win_rate DESC, s.matches_played DESC
          LIMIT 10
        `, [guildId]);

        if (leaderboardResult.rows.length === 0) {
          await interaction.editReply({
            content: `📊 **${i18nService.t(locale, 'btn_leaderboard')} Empty**\n\nNo players with at least 5 matches yet!\n\n🎮 Play some matches to appear on the leaderboard.`,
          });
          return;
        }

        // Create leaderboard embed
        const leaderboardEmbed = new EmbedBuilder()
          .setColor('#f39c12')
          .setTitle(`🏆 ${i18nService.t(locale, 'btn_leaderboard')}`)
          .setDescription('*Top 10 players ranked by win rate • Minimum 5 matches required*')
          .setFooter({ text: `Rankings for ${interaction.guild?.name || 'Server'}` })
          .setTimestamp();

        leaderboardResult.rows.forEach((player, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          const username = player.username || `<@${player.discord_id}>`;
          leaderboardEmbed.addFields({
            name: `${medal} ${username}`,
            value: `📊 ${player.matches_played} matches | ✅ ${player.win_rate}% WR | ${player.matches_won}W-${player.matches_lost}L`,
            inline: false
          });
        });

        await dmOrEphemeral(interaction, { embeds: [leaderboardEmbed] });
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
      return;
    }

    // Balance
    if (buttonId === 'dashboard_balance') {
      const balanceEmbed = new EmbedBuilder()
        .setColor('#16a085')
        .setTitle(`⚖️ ${i18nService.t(locale, 'btn_balance')}`)
        .setDescription(
          '**Balance teams based on MMR and move players to voice channels**\n\n' +
          '👥 **Requirements:**\n' +
          '• Be in a voice channel\n' +
          '• At least 2 players\n' +
          '• Steam accounts connected (recommended)\n\n' +
          '📝 **How to use:**\n' +
          '`/balance team1_channel:#radiant team2_channel:#dire`\n\n' +
          '⚙️ **Features:**\n' +
          '• Snake draft distribution\n' +
          '• Automatic player movement\n' +
          '• MMR balance calculation'
        )
        .setFooter({ text: 'Bot needs Move Members permission' });
      
      await interaction.deferReply({ ephemeral: true });
      await dmOrEphemeral(interaction, { embeds: [balanceEmbed] });
      return;
    }

    if (buttonId === 'dashboard_heatmap') {
      if (buttonHandler?.handleButtonInteraction) {
        await buttonHandler.handleButtonInteraction(interaction);
      } else {
        await interaction.reply({
          content: i18nService.t(locale, 'error_generic'),
          ephemeral: true,
        });
      }
      return;
    }

    // ============================================
    // DELEGATE AI ANALYST BUTTONS TO BUTTON HANDLER
    // ============================================
    if (buttonId.startsWith('dashboard_ai_')) {
      if (buttonHandler?.handleButtonInteraction) {
        await buttonHandler.handleButtonInteraction(interaction);
      } else {
        await interaction.reply({
          content: '❌ AI Analyst system is initializing. Please try again in a moment.',
          ephemeral: true
        });
      }
      return;
    }

    // Meta Trends
    if (buttonId === 'dashboard_meta') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        // Fetch meta heroes from OpenDota
        const metaHeroes = await openDota.getMetaHeroes();
        
        if (!metaHeroes || metaHeroes.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_api_unavailable'),
          });
          return;
        }

        // Create meta embed
        const metaEmbed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle(`🎯 ${i18nService.t(locale, 'btn_meta')}`)
          .setDescription('*Top 15 heroes ranked by win rate in professional matches*')
          .setFooter({ text: 'Data from OpenDota • Professional scene statistics' })
          .setTimestamp();

        // Add top 15 heroes
        metaHeroes.slice(0, 15).forEach((hero: any, index: number) => {
          const rank = index + 1;
          const emoji = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
          metaEmbed.addFields({
            name: `${emoji} ${hero.name}`,
            value: `✅ ${hero.winRate}% WR | 📊 ${hero.picks} picks | 🚫 ${hero.bans} bans`,
            inline: false
          });
        });

        await dmOrEphemeral(interaction, { embeds: [metaEmbed] });
      } catch (error) {
        console.error('Error loading meta:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_api_unavailable'),
        });
      }
      return;
    }

    // Hero Builds
    if (buttonId === 'dashboard_builds') {
      // Show modal to ask for hero name
      const modal = new ModalBuilder()
        .setCustomId('builds_hero_modal')
        .setTitle(`🛠️ ${i18nService.t(locale, 'btn_build')}`);

      const heroInput = new TextInputBuilder()
        .setCustomId('hero_name')
        .setLabel('Hero Name')
        .setPlaceholder('e.g., Anti-Mage, Invoker, Phantom Assassin')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(heroInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // AI Coach
    if (buttonId === 'dashboard_ai') {
      await interaction.deferReply({ ephemeral: true });

      try {
        console.log('🤖 AI Coach button clicked by', interaction.user.tag);
        
        // Get Steam ID from database
        const userResult = await pool.query<{ steam_id: string; username: string }>(
          'SELECT steam_id, username FROM users WHERE discord_id = $1',
          [interaction.user.id]
        );

        if (userResult.rows.length === 0) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_steam'),
          });
          return;
        }

        const userRowAI = userResult.rows[0];
        if (!userRowAI) {
          await interaction.editReply({ content: i18nService.t(locale, 'error_no_steam') });
          return;
        }
        const steam32Id = parseInt(userRowAI.steam_id);
        console.log('🔍 Steam ID found:', steam32Id);

        // Show loading message with translation
        await interaction.editReply({
          content: `🤖 **${i18nService.t(locale, 'btn_ai_coach')}**\n\n⏳ ${i18nService.t(locale, 'loading_ai_analysis')}`,
        });

        // Import services
        console.log('📦 Importing services...');
        const stratzService = await import('../services/stratzService.js');
        const geminiService = await import('../services/GeminiService.js');

        // Fetch last match data (with Redis caching)
        console.log('📊 Fetching last match from Stratz...');
        const lastMatch = await stratzService.getLastMatch(steam32Id.toString());

        if (!lastMatch) {
          await interaction.editReply({
            content: i18nService.t(locale, 'error_no_matches'),
          });
          return;
        }
        console.log('✅ Last match found:', lastMatch.matchId, '-', lastMatch.heroName);

        // Generate AI coaching advice (cached in Redis for 7 days)
        console.log('🧠 Generating AI coaching advice with locale:', locale);
        const aiAdvice = await geminiService.generateCoachingAdvice(lastMatch, locale);
        console.log('✅ AI advice generated, length:', aiAdvice.length);

        // Calculate KDA for display
        const kda = lastMatch.deaths === 0 
          ? (lastMatch.kills + lastMatch.assists) 
          : parseFloat(((lastMatch.kills + lastMatch.assists) / lastMatch.deaths).toFixed(2));

        // Format match duration
        const durationMinutes = Math.floor(lastMatch.duration / 60);
        const durationSeconds = lastMatch.duration % 60;
        const durationText = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;

        // Create AI Coach embed with translations
        const coachEmbed = new EmbedBuilder()
          .setColor(lastMatch.result === 'WIN' ? '#4caf50' : '#f44336')
          .setTitle(`🤖 ${i18nService.t(locale, 'btn_ai_coach')} - ${lastMatch.heroName}`)
          .setDescription(aiAdvice)
          .setThumbnail(`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${lastMatch.heroName.toLowerCase().replace(/\s/g, '_')}.png`)
          .setFooter({ 
            text: i18nService.t(locale, 'powered_by_gemini'),
            iconURL: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'
          })
          .setTimestamp();

        // Add match stats
        coachEmbed.addFields(
          { 
            name: i18nService.t(locale, 'match_result'), 
            value: lastMatch.result === 'WIN' 
              ? `🏆 ${i18nService.t(locale, 'victory')}` 
              : `💔 ${i18nService.t(locale, 'defeat')}`, 
            inline: true 
          },
          { 
            name: i18nService.t(locale, 'match_kda'), 
            value: `${lastMatch.kills}/${lastMatch.deaths}/${lastMatch.assists} (${kda})`, 
            inline: true 
          },
          { 
            name: i18nService.t(locale, 'match_duration'), 
            value: durationText, 
            inline: true 
          },
          { 
            name: i18nService.t(locale, 'match_gpm'), 
            value: lastMatch.gpm.toString(), 
            inline: true 
          },
          { 
            name: i18nService.t(locale, 'match_xpm'), 
            value: lastMatch.xpm.toString(), 
            inline: true 
          },
          { 
            name: i18nService.t(locale, 'match_networth'), 
            value: lastMatch.netWorth.toLocaleString(), 
            inline: true 
          }
        );

        await dmOrEphemeral(interaction, { embeds: [coachEmbed] });
      } catch (error) {
        console.error('❌ Error generating AI coaching:', error);
        console.error('Stack trace:', (error as Error).stack);
        
        let errorMessage = i18nService.t(locale, 'error_generic');
        const errorMsg = (error as Error).message || String(error);
        
        // Specific error messages
        if (errorMsg.includes('API key') || errorMsg.includes('GEMINI_API_KEY')) {
          errorMessage = locale === 'pt' 
            ? '⚠️ **AI Coach não configurado**\n\n🔧 O administrador precisa configurar a chave `GEMINI_API_KEY` no arquivo `.env`\n\n📖 Obtenha uma chave grátis em: https://aistudio.google.com/app/apikey'
            : locale === 'es'
            ? '⚠️ **AI Coach no configurado**\n\n🔧 El administrador necesita configurar la clave `GEMINI_API_KEY` en el archivo `.env`\n\n📖 Obtén una clave gratis en: https://aistudio.google.com/app/apikey'
            : '⚠️ **AI Coach not configured**\n\n🔧 Admin needs to set `GEMINI_API_KEY` in `.env` file\n\n📖 Get free key: https://aistudio.google.com/app/apikey';
        } else if (errorMsg.includes('model not found') || errorMsg.includes('404')) {
          errorMessage = locale === 'pt'
            ? '❌ **Modelo Gemini inválido**\n\nVerifique se o modelo no `.env` está correto.\nModelo atual: `gemini-2.0-flash-exp`'
            : locale === 'es'
            ? '❌ **Modelo Gemini inválido**\n\nVerifique que el modelo en `.env` sea correcto.\nModelo actual: `gemini-2.0-flash-exp`'
            : '❌ **Invalid Gemini model**\n\nCheck if model in `.env` is correct.\nCurrent model: `gemini-2.0-flash-exp`';
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
          errorMessage = locale === 'pt'
            ? '⏱️ **Limite de uso atingido**\n\nTente novamente em alguns minutos.\nO AI Coach tem limite de 60 requisições/minuto (plano gratuito).'
            : locale === 'es'
            ? '⏱️ **Límite de uso alcanzado**\n\nInténtalo de nuevo en unos minutos.\nEl AI Coach tiene límite de 60 solicitudes/minuto (plan gratuito).'
            : '⏱️ **Rate limit reached**\n\nTry again in a few minutes.\nAI Coach has 60 requests/minute limit (free tier).';
        }
        
        errorMessage += `\n\n🔍 **Error details:** \`${errorMsg.substring(0, 100)}\``;
        
        await interaction.editReply({
          content: errorMessage,
        });
      }
      return;
    }

    // Unknown button
    await interaction.reply({
      content: i18nService.t(locale, 'error_generic'),
      ephemeral: true,
    });
  },

  async handleModal(interaction: ModalSubmitInteraction) {
    // Initialize dependencies first
    await initializeDependencies();
    
    // Get user's locale for all responses
    const locale = await resolveLocale(interaction);

    if (interaction.customId === 'connect_steam_modal') {
      const steamInput = interaction.fields.getTextInputValue('steam_id_input');
      
      await interaction.deferReply({ flags: 64 }); // ephemeral

      try {
        // Extract Steam32 ID from various formats
        let steam32Id: string | null = null;
        
        // Direct Steam32 ID (9 digits)
        if (/^\d{8,10}$/.test(steamInput)) {
          steam32Id = steamInput;
        }
        // Steam64 ID (17 digits starting with 7656)
        else if (/^7656\d{13}$/.test(steamInput)) {
          const steam64 = BigInt(steamInput);
          const steam64Base = BigInt('76561197960265728');
          steam32Id = String(steam64 - steam64Base);
        }
        // URL format
        else if (steamInput.includes('steamcommunity.com')) {
          const idMatch = steamInput.match(/\/profiles\/(\d+)/);
          if (idMatch && idMatch[1]) {
            const steam64 = BigInt(idMatch[1]);
            const steam64Base = BigInt('76561197960265728');
            steam32Id = String(steam64 - steam64Base);
          } else {
            throw new Error('Invalid Steam profile URL');
          }
        } else {
          throw new Error('Invalid Steam ID format');
        }

        // Verify account exists with OpenDota
        await interaction.editReply('🔍 Verifying Steam account...');
        
        const profile = await openDota.getPlayerProfile(steam32Id);
        
        // Show confirmation with profile data (translated)
        const confirmEmbed = new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Steam Account Found!')
          .setDescription('Please confirm this is your account:')
          .addFields(
            { name: '👤 Username', value: profile.name || 'Unknown', inline: true },
            { name: `🎮 ${i18nService.t(locale, 'profile_matches')}`, value: String(profile.totalMatches || 0), inline: true },
            { name: `📊 ${i18nService.t(locale, 'profile_winrate')}`, value: `${profile.winRate || 0}%`, inline: true },
            { name: '🆔 Steam32 ID', value: steam32Id, inline: false }
          )
          .setThumbnail(profile.avatar || null)
          .setFooter({ text: 'Click Confirm to link this account' });

        const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_steam_${steam32Id}`)
            .setLabel('✅ Confirm')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('cancel_steam')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({
          content: '',
          embeds: [confirmEmbed],
          components: [confirmRow],
        });

      } catch (error) {
        console.error('Error connecting Steam:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'connect_error'),
        });
      }
    }

    // Hero Build Modal
    if (interaction.customId === 'builds_hero_modal') {
      const heroName = interaction.fields.getTextInputValue('hero_name');
      
      await interaction.deferReply({ ephemeral: true });

      try {
        // Create build embed (simplified generic build)
        const buildEmbed = new EmbedBuilder()
          .setColor('#95a5a6')
          .setTitle(`🛠️ ${heroName}`)
          .setDescription('*Recommended item build • Adapt based on your game situation*')
          .addFields(
            { 
              name: '🌱 Starting Items', 
              value: '• Tango\n• Iron Branch x3\n• Circlet\n• Clarity', 
              inline: true 
            },
            { 
              name: '⚡ Early Game', 
              value: '• Magic Wand\n• Boots of Speed\n• Bracer\n• Wind Lace', 
              inline: true 
            },
            { 
              name: '💪 Core Items', 
              value: '• Power Treads\n• Black King Bar\n• Blink Dagger\n• Aghanim\'s Scepter', 
              inline: true 
            },
            { 
              name: '🌟 Luxury/Situational', 
              value: '• Heart of Tarrasque\n• Assault Cuirass\n• Shiva\'s Guard\n• Overwhelming Blink', 
              inline: true 
            },
            {
              name: '💡 Tips',
              value: '• Farm priority: Core items > Luxury\n• Adapt build based on enemy heroes\n• BKB timing is crucial\n• Consider early game tempo items',
              inline: false
            }
          )
          .setFooter({ text: 'Guide based on current meta - Always adapt to your game!' })
          .setTimestamp();

        await dmOrEphemeral(interaction, { embeds: [buildEmbed] });
      } catch (error) {
        console.error('Error loading hero build:', error);
        await interaction.editReply({
          content: i18nService.t(locale, 'error_generic'),
        });
      }
    }
  },
};

export default dashboardCommand;
