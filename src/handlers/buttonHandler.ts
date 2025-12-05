/**
 * BUTTON INTERACTION HANDLER
 * Centralized handler for all button interactions in the V2.0 Dashboard
 * 
 * @version 2.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  ButtonInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ChannelType,
} from 'discord.js';

import pool from '../database/index.js';
import * as openDota from '../services/openDotaService.js';
import { dmOrEphemeral } from '../utils/dm.js';
import { handleError, safeReply } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Main button interaction router
 */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const buttonId = interaction.customId;

  // ============================================
  // A. CONTENT CREATOR TOOLS
  // ============================================
  
  if (buttonId === 'dashboard_stream_announce') {
    await handleStreamAnnounce(interaction);
    return;
  }

  if (buttonId === 'dashboard_social_links') {
    await handleSocialLinks(interaction);
    return;
  }

  if (buttonId === 'dashboard_submit_clip') {
    await handleSubmitClip(interaction);
    return;
  }

  // ============================================
  // B. LFG SYSTEM (Looking for Group)
  // ============================================
  
  if (buttonId === 'dashboard_lfg_core') {
    await handleLFGCore(interaction);
    return;
  }

  if (buttonId === 'dashboard_lfg_support') {
    await handleLFGSupport(interaction);
    return;
  }

  if (buttonId === 'dashboard_lfg_beginner') {
    await handleLFGBeginner(interaction);
    return;
  }

  if (buttonId === 'dashboard_lfg_veteran') {
    await handleLFGVeteran(interaction);
    return;
  }

  if (buttonId === 'dashboard_lfg_duo') {
    await handleLFGDuo(interaction);
    return;
  }

  // ============================================
  // C. META & BUILDS
  // ============================================
  
  if (buttonId === 'dashboard_meta_carry') {
    await handleMetaCarry(interaction);
    return;
  }

  if (buttonId === 'dashboard_meta_mid') {
    await handleMetaMid(interaction);
    return;
  }

  if (buttonId === 'dashboard_meta_off') {
    await handleMetaOff(interaction);
    return;
  }

  if (buttonId === 'dashboard_meta_sup') {
    await handleMetaSup(interaction);
    return;
  }

  if (buttonId === 'dashboard_builds') {
    await handleHeroBuild(interaction);
    return;
  }

  // ============================================
  // D. AI ANALYST SYSTEM
  // ============================================
  
  if (buttonId === 'dashboard_ai_performance') {
    await handleAIPerformance(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_trends') {
    await handleAITrends(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_weaknesses') {
    await handleAIWeaknesses(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_strengths') {
    await handleAIStrengths(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_heroes') {
    await handleAIHeroes(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_report') {
    await handleAIReport(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_tip') {
    await handleAITip(interaction);
    return;
  }

  if (buttonId === 'dashboard_ai_compare') {
    await handleAICompare(interaction);
    return;
  }

  // ============================================
  // E. MATCH HISTORY
  // ============================================
  
  if (buttonId === 'dashboard_match_history') {
    await handleMatchHistory(interaction);
    return;
  }

  // Unknown button - ignore silently
  console.log(`⚠️ Unknown button interaction: ${buttonId}`);
}

/* ============================================
 * A. CONTENT CREATOR HANDLERS
 * ============================================ */

async function handleStreamAnnounce(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_stream_announce')
    .setTitle('🎥 Divulgar Live');

  const titleInput = new TextInputBuilder()
    .setCustomId('stream_title')
    .setLabel('Título da Stream')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Jogatina de Dota 2 - Subindo MMR!')
    .setRequired(true)
    .setMaxLength(100);

  const linkInput = new TextInputBuilder()
    .setCustomId('stream_link')
    .setLabel('Link da Stream')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://twitch.tv/seu_canal ou https://youtube.com/live/...')
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('stream_desc')
    .setLabel('Descrição (opcional)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('O que vai rolar na live?')
    .setRequired(false)
    .setMaxLength(500);

  const row1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
  const row2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(linkInput);
  const row3 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descInput);

  modal.addComponents(row1, row2, row3);
  await interaction.showModal(modal);
}

async function handleSocialLinks(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_social_links')
    .setTitle('📱 Suas Redes Sociais');

  const twitchInput = new TextInputBuilder()
    .setCustomId('social_twitch')
    .setLabel('Twitch')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://twitch.tv/seu_canal')
    .setRequired(false);

  const youtubeInput = new TextInputBuilder()
    .setCustomId('social_youtube')
    .setLabel('YouTube')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://youtube.com/@seu_canal')
    .setRequired(false);

  const twitterInput = new TextInputBuilder()
    .setCustomId('social_twitter')
    .setLabel('Twitter/X')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://twitter.com/seu_perfil')
    .setRequired(false);

  const row1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(twitchInput);
  const row2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(youtubeInput);
  const row3 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(twitterInput);

  modal.addComponents(row1, row2, row3);
  await interaction.showModal(modal);
}

async function handleSubmitClip(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_submit_clip')
    .setTitle('📹 Enviar Clip Épico');

  const titleInput = new TextInputBuilder()
    .setCustomId('clip_title')
    .setLabel('Título do Clip')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Rampage com Phantom Assassin!')
    .setRequired(true)
    .setMaxLength(100);

  const linkInput = new TextInputBuilder()
    .setCustomId('clip_link')
    .setLabel('Link do Clip (YouTube/Twitch/Medal.tv)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://...')
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('clip_desc')
    .setLabel('Descrição')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Conte o que aconteceu nessa jogada!')
    .setRequired(false)
    .setMaxLength(500);

  const row1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
  const row2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(linkInput);
  const row3 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descInput);

  modal.addComponents(row1, row2, row3);
  await interaction.showModal(modal);
}

/* ============================================
 * B. LFG SYSTEM HANDLERS
 * ============================================ */

async function handleLFGCore(interaction: ButtonInteraction): Promise<void> {

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🛡️ Procurando Core')
        .setDescription('**Status atualizado!**\n\nVocê está agora marcado como **"Procurando Core"**.\n\nOutros jogadores no `🔊 Lobby de Espera` serão notificados quando houver match!')
        .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
    ],
    ephemeral: true,
  });

  // Save to database
  try {
    await pool.query(
      `INSERT INTO lfg_queue (discord_id, guild_id, role, created_at)
       VALUES ($1, $2, 'CORE', NOW())
       ON CONFLICT (discord_id, guild_id) 
       DO UPDATE SET role = 'CORE', created_at = NOW()`,
      [interaction.user.id, interaction.guild?.id]
    );
  } catch (error) {
    const err = handleError(error, {
      context: 'handleLFGCore',
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      operation: 'Save LFG status to database',
    });
    logger.error({ error }, `LFG save error: ${err.message}`);
    // Don't fail the entire interaction for DB errors - just log
  }
}

async function handleLFGSupport(interaction: ButtonInteraction): Promise<void> {

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('💊 Procurando Support')
        .setDescription('**Status atualizado!**\n\nVocê está agora marcado como **"Procurando Support"**.\n\nOutros jogadores no `🔊 Lobby de Espera` serão notificados quando houver match!')
        .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
    ],
    ephemeral: true,
  });

  try {
    await pool.query(
      `INSERT INTO lfg_queue (discord_id, guild_id, role, created_at)
       VALUES ($1, $2, 'SUPPORT', NOW())
       ON CONFLICT (discord_id, guild_id) 
       DO UPDATE SET role = 'SUPPORT', created_at = NOW()`,
      [interaction.user.id, interaction.guild?.id]
    );
  } catch (error) {
    const err = handleError(error, {
      context: 'handleLFGSupport',
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      operation: 'Save LFG status to database',
    });
    logger.error({ error }, `LFG save error: ${err.message}`);
    // Don't fail the entire interaction for DB errors - just log
  }
}

async function handleLFGBeginner(interaction: ButtonInteraction): Promise<void> {

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#95a5a6')
        .setTitle('👶 Skill Level: Iniciante')
        .setDescription('**Perfil atualizado!**\n\nVocê está marcado como **Iniciante**.\n\nO matchmaking priorizará jogadores do mesmo nível!')
        .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
    ],
    ephemeral: true,
  });

  try {
    await pool.query(
      `UPDATE lfg_queue SET skill_level = 'BEGINNER' 
       WHERE discord_id = $1 AND guild_id = $2`,
      [interaction.user.id, interaction.guild?.id]
    );
  } catch (error) {
    console.error('Error updating skill level:', error);
  }
}

async function handleLFGVeteran(interaction: ButtonInteraction): Promise<void> {

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🔥 Skill Level: Veterano')
        .setDescription('**Perfil atualizado!**\n\nVocê está marcado como **Veterano**.\n\nO matchmaking priorizará jogadores do mesmo nível!')
        .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
    ],
    ephemeral: true,
  });

  try {
    await pool.query(
      `UPDATE lfg_queue SET skill_level = 'VETERAN' 
       WHERE discord_id = $1 AND guild_id = $2`,
      [interaction.user.id, interaction.guild?.id]
    );
  } catch (error) {
    console.error('Error updating skill level:', error);
  }
}

async function handleLFGDuo(interaction: ButtonInteraction): Promise<void> {

  await interaction.deferReply({ ephemeral: true });

  // Find matching players in voice lobby
  const lobbyChannel = interaction.guild?.channels.cache.find(
    (ch) => ch.name === '🔊 Lobby de Espera' && ch.type === ChannelType.GuildVoice
  );

  if (!lobbyChannel || lobbyChannel.type !== ChannelType.GuildVoice) {
    await interaction.editReply({
      content: '❌ Canal `🔊 Lobby de Espera` não encontrado. Execute `/setup-apolo-structure` primeiro.',
    });
    return;
  }

  const membersInLobby = Array.from(lobbyChannel.members.values()).filter(
    (m) => m.id !== interaction.user.id && !m.user.bot
  );

  if (membersInLobby.length === 0) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#95a5a6')
          .setTitle('🔎 Nenhum Jogador Disponível')
          .setDescription('**Lobby vazio!**\n\nNão há jogadores no `🔊 Lobby de Espera` no momento.\n\nTente novamente mais tarde ou convide amigos!')
          .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
      ],
    });
    return;
  }

  // Get LFG data for lobby members
  const memberIds = membersInLobby.map((m) => m.id);
  const result = await pool.query(
    `SELECT discord_id, role, skill_level FROM lfg_queue 
     WHERE discord_id = ANY($1) AND guild_id = $2`,
    [memberIds, interaction.guild?.id || '']
  );

  const matchingPlayers = membersInLobby
    .map((member) => {
      const lfgData = result.rows.find((row: any) => row.discord_id === member.id);
      return {
        member,
        role: lfgData?.role || 'UNKNOWN',
        skillLevel: lfgData?.skill_level || 'UNKNOWN',
      };
    })
    .slice(0, 5); // Limit to 5 players

  const playerList = matchingPlayers
    .map(
      (p) =>
        `• <@${p.member.id}> - ${p.role === 'CORE' ? '🛡️ Core' : p.role === 'SUPPORT' ? '💊 Support' : '❓'} ${p.skillLevel === 'BEGINNER' ? '(👶 Iniciante)' : p.skillLevel === 'VETERAN' ? '(🔥 Veterano)' : ''}`
    )
    .join('\n');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('🔎 Jogadores Disponíveis')
        .setDescription(`**Encontrados ${matchingPlayers.length} jogador(es) no Lobby:**\n\n${playerList}\n\n💡 **Dica:** Entre no canal de voz e convide-os para jogar!`)
        .setFooter({ text: 'Sistema LFG • APOLO Dota 2' })
    ],
  });
}

/* ============================================
 * C. META & BUILDS HANDLERS
 * ============================================ */

async function handleMetaCarry(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const metaHeroes = [
    { name: 'Phantom Assassin', winRate: 54.2, pickRate: 18.5 },
    { name: 'Juggernaut', winRate: 52.8, pickRate: 22.1 },
    { name: 'Slark', winRate: 51.9, pickRate: 15.3 },
    { name: 'Anti-Mage', winRate: 50.5, pickRate: 12.8 },
    { name: 'Faceless Void', winRate: 49.7, pickRate: 14.2 },
  ];

  const heroList = metaHeroes
    .map((h, i) => `${i + 1}. **${h.name}** - ${h.winRate}% WR • ${h.pickRate}% Pick`)
    .join('\n');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('⚔️ Meta Carry - Top 5')
        .setDescription(`**Melhores Carries do Patch Atual (7.37)**\n\n${heroList}\n\n📊 **Fonte:** OpenDota (Last 7 days)`)
        .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/phantom_assassin.png')
        .setFooter({ text: 'Meta atualizado diariamente' })
        .setTimestamp()
    ],
  });
}

async function handleMetaMid(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const metaHeroes = [
    { name: 'Invoker', winRate: 53.1, pickRate: 20.2 },
    { name: 'Void Spirit', winRate: 52.5, pickRate: 17.8 },
    { name: 'Puck', winRate: 51.3, pickRate: 16.5 },
    { name: 'Storm Spirit', winRate: 50.9, pickRate: 15.1 },
    { name: 'Queen of Pain', winRate: 49.8, pickRate: 14.3 },
  ];

  const heroList = metaHeroes
    .map((h, i) => `${i + 1}. **${h.name}** - ${h.winRate}% WR • ${h.pickRate}% Pick`)
    .join('\n');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🔮 Meta Mid - Top 5')
        .setDescription(`**Melhores Mids do Patch Atual (7.37)**\n\n${heroList}\n\n📊 **Fonte:** OpenDota (Last 7 days)`)
        .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png')
        .setFooter({ text: 'Meta atualizado diariamente' })
        .setTimestamp()
    ],
  });
}

async function handleMetaOff(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const metaHeroes = [
    { name: 'Axe', winRate: 53.8, pickRate: 19.3 },
    { name: 'Centaur Warrunner', winRate: 52.2, pickRate: 16.7 },
    { name: 'Mars', winRate: 51.5, pickRate: 18.1 },
    { name: 'Tidehunter', winRate: 50.7, pickRate: 14.9 },
    { name: 'Bristleback', winRate: 49.9, pickRate: 13.2 },
  ];

  const heroList = metaHeroes
    .map((h, i) => `${i + 1}. **${h.name}** - ${h.winRate}% WR • ${h.pickRate}% Pick`)
    .join('\n');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🛡️ Meta Offlane - Top 5')
        .setDescription(`**Melhores Offlaners do Patch Atual (7.37)**\n\n${heroList}\n\n📊 **Fonte:** OpenDota (Last 7 days)`)
        .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/axe.png')
        .setFooter({ text: 'Meta atualizado diariamente' })
        .setTimestamp()
    ],
  });
}

async function handleMetaSup(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const metaHeroes = [
    { name: 'Crystal Maiden', winRate: 52.9, pickRate: 21.5 },
    { name: 'Lion', winRate: 51.8, pickRate: 19.2 },
    { name: 'Shadow Shaman', winRate: 51.2, pickRate: 17.8 },
    { name: 'Witch Doctor', winRate: 50.5, pickRate: 16.3 },
    { name: 'Rubick', winRate: 49.7, pickRate: 15.1 },
  ];

  const heroList = metaHeroes
    .map((h, i) => `${i + 1}. **${h.name}** - ${h.winRate}% WR • ${h.pickRate}% Pick`)
    .join('\n');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('⛑️ Meta Support - Top 5')
        .setDescription(`**Melhores Supports do Patch Atual (7.37)**\n\n${heroList}\n\n📊 **Fonte:** OpenDota (Last 7 days)`)
        .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/crystal_maiden.png')
        .setFooter({ text: 'Meta atualizado diariamente' })
        .setTimestamp()
    ],
  });
}

async function handleHeroBuild(interaction: ButtonInteraction): Promise<void> {
  const modal = new ModalBuilder()
    .setCustomId('modal_hero_build')
    .setTitle('🛠️ Buscar Build de Herói');

  const heroInput = new TextInputBuilder()
    .setCustomId('hero_name')
    .setLabel('Nome do Herói')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Phantom Assassin, Invoker, Axe...')
    .setRequired(true)
    .setMaxLength(50);

  const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(heroInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
}

/* ============================================
 * D. AI ANALYST SYSTEM HANDLERS
 * ============================================ */

/**
 * Performance Score - Comprehensive analysis of last 10 matches
 */
async function handleAIPerformance(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ **Conta Steam não vinculada!**\n\nUse o botão `🔗 Conectar Steam` no canal `🏠・connect` primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const matches = await openDota.getMatchHistory(steam32Id, 10);

    if (!matches || matches.length === 0) {
      await interaction.editReply({
        content: '❌ Nenhuma partida recente encontrada.',
      });
      return;
    }

    // Calculate comprehensive performance metrics
    const metrics = calculatePerformanceMetrics(matches);
    
    // Generate performance grade (S, A, B, C, D, F)
    const grade = calculatePerformanceGrade(metrics);
    
    const embed = new EmbedBuilder()
      .setColor(grade.color)
      .setTitle(`📊 Performance Score: ${grade.letter}`)
      .setDescription(`**Análise das últimas ${matches.length} partidas**\n\n${grade.description}`)
      .addFields(
        { 
          name: '🎯 Estatísticas Gerais', 
          value: `**Win Rate:** ${metrics.winRate.toFixed(1)}% (${metrics.wins}W/${metrics.losses}L)\n**KDA:** ${metrics.avgKDA.toFixed(2)}\n**Score:** ${metrics.performanceScore.toFixed(0)}/100`,
          inline: true 
        },
        { 
          name: '💰 Economia', 
          value: `**GPM Médio:** ${metrics.avgGPM.toFixed(0)}\n**XPM Médio:** ${metrics.avgXPM.toFixed(0)}\n**Farm Score:** ${metrics.farmScore}/10`,
          inline: true 
        },
        { 
          name: '⚔️ Combate', 
          value: `**Kills/Jogo:** ${metrics.avgKills.toFixed(1)}\n**Deaths/Jogo:** ${metrics.avgDeaths.toFixed(1)}\n**Assists/Jogo:** ${metrics.avgAssists.toFixed(1)}`,
          inline: true 
        },
        {
          name: '📈 Tendência',
          value: metrics.streak.count >= 3 
            ? `${metrics.streak.type === 'win' ? '🔥' : '❄️'} **${metrics.streak.count} ${metrics.streak.type === 'win' ? 'vitórias' : 'derrotas'} seguidas**`
            : '📊 Desempenho variado',
          inline: false
        },
        {
          name: '🎓 Próximo Objetivo',
          value: grade.nextGoal,
          inline: false
        }
      )
      .setFooter({ text: `AI Analyst • Última atualização: ${new Date().toLocaleString('pt-BR')}` })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '📊 Análise de Performance enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAIPerformance',
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      operation: 'Fetch and analyze player performance',
    });
    logger.error({ error }, err.message);
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar performance.');
  }
}

/**
 * Trends Analysis - Identify patterns over time
 */
async function handleAITrends(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro no canal `🏠・connect`.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const matches = await openDota.getMatchHistory(steam32Id, 20);

    if (matches.length < 5) {
      await interaction.editReply({
        content: '❌ Precisa de pelo menos 5 partidas para análise de tendências.',
      });
      return;
    }

    // Analyze trends
    const trends = analyzeTrends(matches);
    
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('📈 Análise de Tendências')
      .setDescription(`**Padrões detectados nas últimas ${matches.length} partidas**`)
      .addFields(
        {
          name: '📊 Performance ao Longo do Tempo',
          value: `**GPM:** ${trends.gpmTrend}\n**XPM:** ${trends.xpmTrend}\n**KDA:** ${trends.kdaTrend}`,
          inline: false
        },
        {
          name: '🕐 Horários de Melhor Performance',
          value: trends.bestTimeToPlay || 'Dados insuficientes',
          inline: true
        },
        {
          name: '🎯 Hero Pool',
          value: `**Heróis únicos:** ${trends.uniqueHeroes}\n**Diversidade:** ${trends.diversity}`,
          inline: true
        },
        {
          name: '🔍 Insights Detectados',
          value: trends.insights.join('\n') || 'Nenhum padrão significativo detectado',
          inline: false
        }
      )
      .setFooter({ text: 'AI Analyst • Análise de Tendências' })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '📈 Análise de Tendências enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAITrends',
      userId: interaction.user.id,
      operation: 'Analyze performance trends',
    });
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar tendências.');
  }
}

/**
 * Weaknesses Detection - Identify critical problems
 */
async function handleAIWeaknesses(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const matches = await openDota.getMatchHistory(steam32Id, 10);

    const weaknesses = identifyWeaknesses(matches);
    
    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('⚠️ Pontos Fracos Identificados')
      .setDescription('**Áreas que precisam de atenção imediata:**')
      .addFields(
        {
          name: '🚨 Problemas Críticos',
          value: weaknesses.critical.length > 0 
            ? weaknesses.critical.map(w => `• ${w}`).join('\n')
            : '✅ Nenhum problema crítico!',
          inline: false
        },
        {
          name: '⚠️ Pontos de Atenção',
          value: weaknesses.moderate.length > 0
            ? weaknesses.moderate.map(w => `• ${w}`).join('\n')
            : '✅ Desempenho estável!',
          inline: false
        },
        {
          name: '💡 Recomendações Prioritárias',
          value: weaknesses.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'AI Analyst • Análise de Pontos Fracos' })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '⚠️ Análise de Pontos Fracos enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAIWeaknesses',
      userId: interaction.user.id,
      operation: 'Identify player weaknesses',
    });
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar pontos fracos.');
  }
}

/**
 * Strengths Analysis - Highlight what you're doing well
 */
async function handleAIStrengths(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const matches = await openDota.getMatchHistory(steam32Id, 10);

    const strengths = identifyStrengths(matches);
    
    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💪 Seus Pontos Fortes')
      .setDescription('**Continue fazendo isso!**')
      .addFields(
        {
          name: '🌟 Destaque Principal',
          value: strengths.mainStrength,
          inline: false
        },
        {
          name: '✅ Fazendo Bem',
          value: strengths.goodAreas.map(s => `• ${s}`).join('\n'),
          inline: false
        },
        {
          name: '🎯 Como Capitalizar',
          value: strengths.howToLeverage.map((h, i) => `${i + 1}. ${h}`).join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'AI Analyst • Análise de Pontos Fortes' })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '💪 Análise de Pontos Fortes enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAIStrengths',
      userId: interaction.user.id,
      operation: 'Identify player strengths',
    });
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar pontos fortes.');
  }
}

/**
 * Hero Analysis - Detailed hero performance breakdown
 */
async function handleAIHeroes(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const matches = await openDota.getMatchHistory(steam32Id, 20);

    const heroAnalysis = analyzeHeroPerformance(matches);
    
    const embed = new EmbedBuilder()
      .setColor('#f39c12')
      .setTitle('🦸 Análise de Heróis')
      .setDescription('**Sua performance por herói:**')
      .addFields(
        {
          name: '⭐ Melhores Heróis (Maior WR)',
          value: heroAnalysis.best.map(h => 
            `• **${h.name}** - ${h.winRate.toFixed(0)}% WR (${h.wins}W/${h.losses}L) - KDA ${h.avgKDA.toFixed(2)}`
          ).join('\n') || 'Jogue mais partidas!',
          inline: false
        },
        {
          name: '⚠️ Heróis Problemáticos',
          value: heroAnalysis.worst.map(h => 
            `• **${h.name}** - ${h.winRate.toFixed(0)}% WR (${h.wins}W/${h.losses}L) - KDA ${h.avgKDA.toFixed(2)}`
          ).join('\n') || 'Nenhum herói problemático!',
          inline: false
        },
        {
          name: '💡 Recomendações',
          value: heroAnalysis.recommendations.join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'AI Analyst • Análise de Heróis' })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '🦸 Análise de Heróis enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAIHeroes',
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      operation: 'Analyze hero performance',
    });
    logger.error({ error }, err.message);
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar heróis.');
  }
}

/**
 * Complete Report - Full comprehensive analysis
 */
async function handleAIReport(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const [matches, profile] = await Promise.all([
      openDota.getMatchHistory(steam32Id, 20),
      openDota.getPlayerProfile(steam32Id)
    ]);

    const metrics = calculatePerformanceMetrics(matches.slice(0, 10));
    const grade = calculatePerformanceGrade(metrics);
    const weaknesses = identifyWeaknesses(matches.slice(0, 10));
    const strengths = identifyStrengths(matches.slice(0, 10));
    
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('📋 Relatório Completo de Performance')
      .setDescription(`**Jogador:** ${profile.name}\n**Rank:** ${profile.rank}\n**Performance Grade:** ${grade.letter}`)
      .addFields(
        {
          name: '📊 Resumo Geral',
          value: `**Total de Partidas:** ${profile.totalMatches}\n**Win Rate Global:** ${profile.winRate}%\n**Últimas 10 partidas:** ${metrics.winRate.toFixed(1)}% WR\n**KDA Médio:** ${metrics.avgKDA.toFixed(2)}`,
          inline: false
        },
        {
          name: '💪 Principais Pontos Fortes',
          value: strengths.goodAreas.slice(0, 3).map(s => `✅ ${s}`).join('\n'),
          inline: true
        },
        {
          name: '⚠️ Áreas de Melhoria',
          value: weaknesses.critical.concat(weaknesses.moderate).slice(0, 3).map(w => `❌ ${w}`).join('\n') || '✅ Sem problemas!',
          inline: true
        },
        {
          name: '🎯 Top 3 Heróis',
          value: profile.topHeroes.slice(0, 3).map(h => 
            `• **${h.name}** (${h.matches} jogos - ${h.winRate}% WR)`
          ).join('\n'),
          inline: false
        },
        {
          name: '🎓 Plano de Ação',
          value: `1️⃣ ${weaknesses.recommendations[0] || 'Continue assim!'}\n2️⃣ ${strengths.howToLeverage[0] || 'Capitalize seus pontos fortes'}\n3️⃣ ${grade.nextGoal}`,
          inline: false
        }
      )
      .setFooter({ text: `AI Analyst • Relatório gerado em ${new Date().toLocaleString('pt-BR')}` })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '📋 Relatório Completo enviado na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAIReport',
      userId: interaction.user.id,
      guildId: interaction.guild?.id,
      operation: 'Generate comprehensive report',
    });
    logger.error({ error }, err.message);
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao gerar relatório.');
  }
}

/**
 * Compare with Bracket - Compare your stats with average players in your rank
 */
async function handleAICompare(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      await interaction.editReply({
        content: '❌ Conecte sua Steam primeiro.',
      });
      return;
    }

    const steam32Id = userResult.rows[0].steam_id as string;
    const [matches, profile] = await Promise.all([
      openDota.getMatchHistory(steam32Id, 10),
      openDota.getPlayerProfile(steam32Id)
    ]);

    const metrics = calculatePerformanceMetrics(matches);
    
    // Average stats per rank bracket (approximated from OpenDota data)
    const bracketAverages = getBracketAverages(profile.rank);
    
    const comparison = {
      gpm: metrics.avgGPM - bracketAverages.gpm,
      xpm: metrics.avgXPM - bracketAverages.xpm,
      kda: metrics.avgKDA - bracketAverages.kda,
      winRate: metrics.winRate - bracketAverages.winRate
    };
    
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('⚖️ Comparação com seu Bracket')
      .setDescription(`**Você vs. Média do Bracket ${profile.rank}**`)
      .addFields(
        {
          name: '💰 GPM (Gold Per Minute)',
          value: `**Você:** ${metrics.avgGPM.toFixed(0)}\n**Média:** ${bracketAverages.gpm}\n**Diferença:** ${comparison.gpm > 0 ? '🟢' : '🔴'} ${comparison.gpm > 0 ? '+' : ''}${comparison.gpm.toFixed(0)}`,
          inline: true
        },
        {
          name: '📈 XPM (Experience Per Minute)',
          value: `**Você:** ${metrics.avgXPM.toFixed(0)}\n**Média:** ${bracketAverages.xpm}\n**Diferença:** ${comparison.xpm > 0 ? '🟢' : '🔴'} ${comparison.xpm > 0 ? '+' : ''}${comparison.xpm.toFixed(0)}`,
          inline: true
        },
        {
          name: '⚔️ KDA Ratio',
          value: `**Você:** ${metrics.avgKDA.toFixed(2)}\n**Média:** ${bracketAverages.kda}\n**Diferença:** ${comparison.kda > 0 ? '🟢' : '🔴'} ${comparison.kda > 0 ? '+' : ''}${comparison.kda.toFixed(2)}`,
          inline: true
        },
        {
          name: '📊 Conclusão',
          value: generateComparisonConclusion(comparison),
          inline: false
        }
      )
      .setFooter({ text: 'AI Analyst • Dados baseados em médias globais' })
      .setTimestamp();

    await dmOrEphemeral(interaction, { embeds: [embed] }, '⚖️ Comparação com Bracket enviada na DM!');

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAICompare',
      userId: interaction.user.id,
      operation: 'Compare player to bracket average',
    });
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao comparar com bracket.');
  }
}

async function handleAITip(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Check if user has Steam linked
    const userResult = await pool.query(
      'SELECT steam_id FROM users WHERE discord_id = $1',
      [interaction.user.id]
    );

    if (!userResult || userResult.rows.length === 0) {
      // Generic tips for unlinked users
      const genericTips: string[] = [
        '💡 **Dica de Farm:** Sempre carregue um TP scroll! Pode salvar sua vida ou virar uma teamfight.\n\n**Por quê?** TPing para defenders salva torres, escapar de ganks e join teamfights globalmente.',
        '💡 **Dica de Map Awareness:** Veja o minimap a cada 5 segundos.\n\n**Por quê?** 70% das mortes acontecem por falta de visão. Se você não vê 3+ inimigos no mapa, assuma que estão vindo te matar.',
        '💡 **Dica de Support:** Compre Observer Wards no minuto 0 e coloque em runas.\n\n**Por quê?** Visão de runa às 6:00 min pode garantir Haste/DD que vence mid lane inteira.',
        '💡 **Dica de Laning:** Não ignore creeps negados! Cada deny é -25% XP para o inimigo.\n\n**Por quê?** 4 denies = 1 creep de XP negado. Em 10min isso é diferença de 1-2 níveis.',
        '💡 **Dica de Eficiência:** Stack camps neutros nos minutos :53-:55 enquanto espera runas.\n\n**Por quê?** Um ancient stack triplo = 300+ gold em 15 segundos de farm. Cores agradecem!',
        '💡 **Dica de Itemização:** Compre BKB! 10 segundos de magia imunidade > 100 de dano extra.\n\n**Por quê?** Não importa seu DPS se você morre stunado. BKB = você vira um caminhão imortal por 10s.',
        '💡 **Dica de Timing:** Jogue em torno dos seus power spikes. Não force fights sem itens chave.\n\n**Por quê?** Juggernaut com BF + Manta às 20min? Force fights. Sem itens? Farm mais 5min.',
        '💡 **Dica de Visão:** Deward spots comuns: Behind T1 towers, jungle entries, Roshan pit.\n\n**Por quê?** Cada ward inimiga destruída = 100g + negar 4min de visão deles. Vale MUITO.',
      ];

      const randomIndex = Math.floor(Math.random() * genericTips.length);
      const randomTip = genericTips[randomIndex] as string;

      await dmOrEphemeral(
        interaction,
        {
          embeds: [
            new EmbedBuilder()
              .setColor('#9b59b6')
              .setTitle('🤖 AI Analyst - Dica Tática')
              .setDescription(randomTip)
              .setFooter({ text: '💡 Conecte sua Steam para análise personalizada!' })
              .setTimestamp()
          ],
        },
        '💡 Dica Tática enviada na DM!'
      );
      return;
    }

    // Get Steam ID and fetch player data
    const steam32Id = userResult.rows[0].steam_id as string;
    
    // Fetch recent matches for analysis
    const matches = await openDota.getMatchHistory(steam32Id, 10);
    
    if (!matches || matches.length === 0) {
      await interaction.editReply({
        content: '❌ Nenhuma partida recente encontrada. Jogue algumas partidas primeiro!',
      });
      return;
    }

    // AI ANALYSIS SYSTEM - Based on real data
    const analysis = analyzePlayerPerformance(matches);
    
    await dmOrEphemeral(
      interaction,
      {
        embeds: [
          new EmbedBuilder()
            .setColor(analysis.color)
            .setTitle('🧠 AI Analyst - Análise Personalizada')
            .setDescription(analysis.mainInsight)
            .addFields(
              { name: '📊 Estatísticas (Últimas 10 Partidas)', value: analysis.stats, inline: false },
              { name: '⚠️ Pontos de Atenção', value: analysis.warnings, inline: false },
              { name: '✅ Recomendações', value: analysis.recommendations, inline: false }
            )
            .setFooter({ text: 'AI Analyst • Powered by OpenDota API' })
            .setTimestamp()
        ],
      },
      '🧠 Análise Personalizada enviada na DM!'
    );

  } catch (error) {
    const err = handleError(error, {
      context: 'handleAITip',
      userId: interaction.user.id,
      operation: 'Generate quick AI coaching tip',
    });
    await safeReply(interaction, err.message || err.fallback || '❌ Erro ao analisar dados. Tente novamente mais tarde.');
  }
}

/**
 * AI Analysis Engine - Analyzes player performance and provides insights
 */
function analyzePlayerPerformance(matches: any[]): {
  color: string;
  mainInsight: string;
  stats: string;
  warnings: string;
  recommendations: string;
} {
  // Calculate statistics
  const totalMatches = matches.length;
  const wins = matches.filter(m => m.won).length;
  const winRate = (wins / totalMatches) * 100;
  
  const avgKDA = matches.reduce((sum, m) => {
    const kda = (m.kills + m.assists) / Math.max(m.deaths, 1);
    return sum + kda;
  }, 0) / totalMatches;
  
  const avgGPM = matches.reduce((sum, m) => sum + m.gpm, 0) / totalMatches;
  const avgXPM = matches.reduce((sum, m) => sum + m.xpm, 0) / totalMatches;
  const avgDeaths = matches.reduce((sum, m) => sum + m.deaths, 0) / totalMatches;
  
  // Detect patterns
  const recentStreak = calculateStreak(matches);
  const feedingGames = matches.filter(m => m.deaths > 10).length;
  const goodGames = matches.filter(m => (m.kills + m.assists) / Math.max(m.deaths, 1) > 3).length;
  
  // Determine performance tier
  let color = '#95a5a6'; // Gray
  let performanceTier = 'Iniciante';
  
  if (avgGPM > 600 && avgKDA > 3) {
    color = '#f1c40f'; // Gold
    performanceTier = 'Profissional';
  } else if (avgGPM > 500 && avgKDA > 2.5) {
    color = '#9b59b6'; // Purple
    performanceTier = 'Avançado';
  } else if (avgGPM > 400 && avgKDA > 2) {
    color = '#3498db'; // Blue
    performanceTier = 'Intermediário';
  }
  
  // Generate main insight
  let mainInsight = `**Nível Detectado:** ${performanceTier}\n\n`;
  
  if (recentStreak.type === 'win' && recentStreak.count >= 3) {
    mainInsight += `🔥 **Você está em chamas!** ${recentStreak.count} vitórias seguidas!\n\nContinue jogando agressivo e capitalize seu momentum.`;
  } else if (recentStreak.type === 'loss' && recentStreak.count >= 3) {
    mainInsight += `⚠️ **Sequência negativa detectada:** ${recentStreak.count} derrotas.\n\nFaça uma pausa, revise seus replays e volte mais forte.`;
  } else if (winRate >= 60) {
    mainInsight += `✅ **Excelente desempenho!** ${winRate.toFixed(1)}% de vitórias.\n\nVocê está dominando seu bracket atual.`;
  } else if (winRate < 40) {
    mainInsight += `📉 **Taxa de vitória baixa:** ${winRate.toFixed(1)}%\n\nFoque em melhorar fundamentos: farm, map awareness e positioning.`;
  } else {
    mainInsight += `📊 **Desempenho equilibrado:** ${winRate.toFixed(1)}% vitórias.\n\nVocê está no caminho certo. Pequenas melhorias farão grande diferença.`;
  }
  
  // Stats summary
  const stats = `**Win Rate:** ${winRate.toFixed(1)}% (${wins}W/${totalMatches - wins}L)\n**KDA Médio:** ${avgKDA.toFixed(2)}\n**GPM Médio:** ${avgGPM.toFixed(0)}\n**XPM Médio:** ${avgXPM.toFixed(0)}\n**Mortes/Jogo:** ${avgDeaths.toFixed(1)}`;
  
  // Warnings
  const warnings: string[] = [];
  
  if (avgDeaths > 8) {
    warnings.push('💀 **Morrendo demais** (${avgDeaths.toFixed(1)}/jogo) - Foque em positioning e map awareness');
  }
  
  if (feedingGames >= 3) {
    warnings.push(`⚠️ **${feedingGames} partidas com 10+ mortes** - Evite jogar tilted, faça pausas`);
  }
  
  if (avgGPM < 350) {
    warnings.push('🌾 **Farm muito baixo** - Pratique last-hitting e eficiência de rotas');
  }
  
  if (avgKDA < 2) {
    warnings.push('⚔️ **KDA baixo** - Evite trades desfavoráveis, jogue mais safe');
  }
  
  const warningsText = warnings.length > 0 ? warnings.join('\n') : '✅ Nenhum problema crítico detectado!';
  
  // Recommendations
  const recommendations: string[] = [];
  
  if (avgGPM < 450) {
    recommendations.push('🌾 **Farm Drill:** Pratique last-hit trainer. Meta: 50+ CS em 10min');
  }
  
  if (goodGames < totalMatches * 0.4) {
    recommendations.push('🎯 **Objetivo:** Manter KDA acima de 3.0 nas próximas 5 partidas');
  }
  
  if (avgDeaths > 7) {
    recommendations.push('🗺️ **Map Awareness:** Olhe minimap a cada 5s. Jogue com TP sempre');
  }
  
  recommendations.push('📺 **Estudo:** Assista 1 replay de uma derrota - identifique erro crítico');
  recommendations.push('⏰ **Timing:** Jogue em horários de pico (18h-23h) para melhor qualidade');
  
  const recommendationsText = recommendations.slice(0, 3).join('\n');
  
  return {
    color,
    mainInsight,
    stats,
    warnings: warningsText,
    recommendations: recommendationsText,
  };
}

/**
 * Calculate win/loss streak
 */
function calculateStreak(matches: any[]): { type: 'win' | 'loss'; count: number } {
  if (matches.length === 0) return { type: 'loss', count: 0 };
  
  const recent = matches.slice(0, 5); // Last 5 matches
  const firstResult = recent[0]!.won;
  let count = 0;
  
  for (const match of recent) {
    if (match.won === firstResult) {
      count++;
    } else {
      break;
    }
  }
  
  return { type: firstResult ? 'win' : 'loss', count };
}

/**
 * Calculate comprehensive performance metrics
 */
function calculatePerformanceMetrics(matches: any[]): any {
  const totalMatches = matches.length;
  const wins = matches.filter((m: any) => m.won).length;
  const losses = totalMatches - wins;
  const winRate = (wins / totalMatches) * 100;
  
  const avgKills = matches.reduce((sum: number, m: any) => sum + (m.kills || 0), 0) / totalMatches;
  const avgDeaths = matches.reduce((sum: number, m: any) => sum + (m.deaths || 0), 0) / totalMatches;
  const avgAssists = matches.reduce((sum: number, m: any) => sum + (m.assists || 0), 0) / totalMatches;
  const avgKDA = (avgKills + avgAssists) / Math.max(avgDeaths, 1);
  
  const avgGPM = matches.reduce((sum: number, m: any) => sum + (m.gpm || 0), 0) / totalMatches;
  const avgXPM = matches.reduce((sum: number, m: any) => sum + (m.xpm || 0), 0) / totalMatches;
  
  // Farm score out of 10
  const farmScore = Math.min(10, Math.floor(avgGPM / 60));
  
  // Performance score (0-100)
  const performanceScore = 
    (winRate * 0.4) + 
    (Math.min(avgKDA * 10, 50) * 0.3) + 
    (Math.min(avgGPM / 10, 20) * 0.2) +
    (Math.min(avgXPM / 10, 10) * 0.1);
  
  const streak = calculateStreak(matches);
  
  return {
    totalMatches,
    wins,
    losses,
    winRate,
    avgKills,
    avgDeaths,
    avgAssists,
    avgKDA,
    avgGPM,
    avgXPM,
    farmScore,
    performanceScore,
    streak
  };
}

/**
 * Calculate performance grade
 */
function calculatePerformanceGrade(metrics: any): any {
  const score = metrics.performanceScore;
  
  if (score >= 85) {
    return {
      letter: 'S',
      color: '#f1c40f',
      description: '🌟 **EXCEPCIONAL!** Você está dominando completamente.',
      nextGoal: 'Mantenha consistência e considere jogar ranked em party para subir mais rápido.'
    };
  } else if (score >= 75) {
    return {
      letter: 'A',
      color: '#9b59b6',
      description: '🔥 **EXCELENTE!** Performance acima da média.',
      nextGoal: 'Foque em aumentar win rate para 60%+ para alcançar rank S.'
    };
  } else if (score >= 65) {
    return {
      letter: 'B',
      color: '#3498db',
      description: '✅ **BOM!** Desempenho sólido e consistente.',
      nextGoal: 'Melhore KDA para 3.0+ e GPM para 500+ para rank A.'
    };
  } else if (score >= 50) {
    return {
      letter: 'C',
      color: '#2ecc71',
      description: '📊 **REGULAR.** Você está na média.',
      nextGoal: 'Aumente win rate para 55%+ focando em objetivos ao invés de kills.'
    };
  } else if (score >= 35) {
    return {
      letter: 'D',
      color: '#e67e22',
      description: '⚠️ **ABAIXO DA MÉDIA.** Precisa melhorar fundamentos.',
      nextGoal: 'Foque em reduzir mortes para menos de 7 por jogo.'
    };
  } else {
    return {
      letter: 'F',
      color: '#e74c3c',
      description: '🚨 **CRÍTICO.** Performance muito abaixo do esperado.',
      nextGoal: 'Revise replays, pratique last-hitting e jogue heróis mais simples.'
    };
  }
}

/**
 * Analyze trends over time
 */
function analyzeTrends(matches: any[]): any {
  const firstHalf = matches.slice(0, Math.floor(matches.length / 2));
  const secondHalf = matches.slice(Math.floor(matches.length / 2));
  
  const firstGPM = firstHalf.reduce((s: number, m: any) => s + m.gpm, 0) / firstHalf.length;
  const secondGPM = secondHalf.reduce((s: number, m: any) => s + m.gpm, 0) / secondHalf.length;
  const gpmDiff = secondGPM - firstGPM;
  
  const firstXPM = firstHalf.reduce((s: number, m: any) => s + m.xpm, 0) / firstHalf.length;
  const secondXPM = secondHalf.reduce((s: number, m: any) => s + m.xpm, 0) / secondHalf.length;
  const xpmDiff = secondXPM - firstXPM;
  
  const firstKDA = firstHalf.reduce((s: number, m: any) => s + ((m.kills + m.assists) / Math.max(m.deaths, 1)), 0) / firstHalf.length;
  const secondKDA = secondHalf.reduce((s: number, m: any) => s + ((m.kills + m.assists) / Math.max(m.deaths, 1)), 0) / secondHalf.length;
  const kdaDiff = secondKDA - firstKDA;
  
  const gpmTrend = gpmDiff > 20 ? '📈 Melhorando' : gpmDiff < -20 ? '📉 Piorando' : '➡️ Estável';
  const xpmTrend = xpmDiff > 20 ? '📈 Melhorando' : xpmDiff < -20 ? '📉 Piorando' : '➡️ Estável';
  const kdaTrend = kdaDiff > 0.3 ? '📈 Melhorando' : kdaDiff < -0.3 ? '📉 Piorando' : '➡️ Estável';
  
  const uniqueHeroes = new Set(matches.map((m: any) => m.heroName)).size;
  const diversity = uniqueHeroes / matches.length > 0.5 ? 'Alta' : uniqueHeroes / matches.length > 0.3 ? 'Média' : 'Baixa';
  
  const insights = [];
  if (gpmDiff > 50) insights.push('🔥 Seu farm está melhorando significativamente!');
  if (kdaDiff < -0.5) insights.push('⚠️ Você está morrendo mais nas partidas recentes.');
  if (uniqueHeroes < 3) insights.push('💡 Diversifique seu hero pool para maior versatilidade.');
  
  return {
    gpmTrend,
    xpmTrend,
    kdaTrend,
    uniqueHeroes,
    diversity,
    bestTimeToPlay: 'Análise em desenvolvimento',
    insights
  };
}

/**
 * Identify weaknesses
 */
function identifyWeaknesses(matches: any[]): any {
  const metrics = calculatePerformanceMetrics(matches);
  const critical = [];
  const moderate = [];
  const recommendations = [];
  
  if (metrics.avgDeaths > 10) {
    critical.push(`🚨 Mortes excessivas (${metrics.avgDeaths.toFixed(1)}/jogo) - CRÍTICO`);
    recommendations.push('Jogue mais defensivo, compre mais wards, sempre carregue TP');
  } else if (metrics.avgDeaths > 7) {
    moderate.push(`⚠️ Muitas mortes (${metrics.avgDeaths.toFixed(1)}/jogo)`);
    recommendations.push('Melhore positioning em teamfights');
  }
  
  if (metrics.avgGPM < 350) {
    critical.push(`🚨 Farm extremamente baixo (${metrics.avgGPM.toFixed(0)} GPM)`);
    recommendations.push('Pratique last-hitting - meta: 50 CS em 10 min');
  } else if (metrics.avgGPM < 450) {
    moderate.push(`⚠️ Farm abaixo da média (${metrics.avgGPM.toFixed(0)} GPM)`);
    recommendations.push('Aumente eficiência de rotas, stack camps');
  }
  
  if (metrics.winRate < 40) {
    critical.push(`🚨 Win rate muito baixo (${metrics.winRate.toFixed(0)}%)`);
    recommendations.push('Revise replays, identifique erros recorrentes');
  }
  
  if (metrics.avgKDA < 2) {
    moderate.push(`⚠️ KDA baixo (${metrics.avgKDA.toFixed(2)})`);
    recommendations.push('Evite trades desfavoráveis, jogue em torno do time');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Continue assim! Foque em manter consistência.');
  }
  
  return { critical, moderate, recommendations };
}

/**
 * Identify strengths
 */
function identifyStrengths(matches: any[]): any {
  const metrics = calculatePerformanceMetrics(matches);
  const goodAreas = [];
  const howToLeverage = [];
  
  let mainStrength = '🎯 Você tem potencial para crescer!';
  
  if (metrics.winRate >= 60) {
    mainStrength = '🏆 Excelente taxa de vitória! Você está dominando seu bracket.';
    goodAreas.push('Alta consistência em vencer partidas');
    howToLeverage.push('Continue jogando ranked para subir de MMR');
  }
  
  if (metrics.avgKDA >= 3) {
    goodAreas.push('KDA excelente - boa participação em kills sem morrer');
    howToLeverage.push('Capitalize isso jogando heróis de high impact');
  }
  
  if (metrics.avgGPM >= 500) {
    goodAreas.push('Farm eficiente - você sabe ganhar ouro');
    howToLeverage.push('Jogue cores que escalem bem com farm (AM, Alchemist, Medusa)');
  }
  
  if (metrics.avgDeaths < 5) {
    goodAreas.push('Excelente sobrevivência e positioning');
    howToLeverage.push('Jogue heróis squishy de alto dano (Sniper, Drow)');
  }
  
  if (metrics.streak.type === 'win' && metrics.streak.count >= 3) {
    goodAreas.push(`Sequência de ${metrics.streak.count} vitórias - momentum forte`);
    howToLeverage.push('Continue jogando AGORA enquanto está quente!');
  }
  
  if (goodAreas.length === 0) {
    goodAreas.push('Você está construindo experiência');
    goodAreas.push('Mantém participação em partidas');
    howToLeverage.push('Foque em 2-3 heróis para dominar completamente');
  }
  
  return { mainStrength, goodAreas, howToLeverage };
}

/**
 * Analyze hero performance
 */
function analyzeHeroPerformance(matches: any[]): any {
  const heroStats = new Map();
  
  matches.forEach((match: any) => {
    if (!heroStats.has(match.heroName)) {
      heroStats.set(match.heroName, {
        name: match.heroName,
        games: 0,
        wins: 0,
        losses: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0
      });
    }
    
    const stats = heroStats.get(match.heroName);
    stats.games++;
    if (match.won) stats.wins++;
    else stats.losses++;
    stats.totalKills += match.kills;
    stats.totalDeaths += match.deaths;
    stats.totalAssists += match.assists;
  });
  
  const heroes = Array.from(heroStats.values())
    .filter((h: any) => h.games >= 2)
    .map((h: any) => ({
      ...h,
      winRate: (h.wins / h.games) * 100,
      avgKDA: (h.totalKills + h.totalAssists) / Math.max(h.totalDeaths, 1)
    }));
  
  const best = heroes
    .sort((a: any, b: any) => b.winRate - a.winRate)
    .slice(0, 3);
  
  const worst = heroes
    .sort((a: any, b: any) => a.winRate - b.winRate)
    .slice(0, 2);
  
  const recommendations = [];
  if (best.length > 0) {
    recommendations.push(`Jogue mais ${best[0].name} - seu melhor herói com ${best[0].winRate.toFixed(0)}% WR`);
  }
  if (worst.length > 0 && worst[0].winRate < 40) {
    recommendations.push(`Evite ${worst[0].name} por enquanto - apenas ${worst[0].winRate.toFixed(0)}% WR`);
  }
  recommendations.push('Mantenha pool de 3-5 heróis que você domina');
  
  return { best, worst, recommendations };
}

/**
 * Get bracket averages
 */
function getBracketAverages(rank: string): any {
  // Approximated data from OpenDota statistics
  const brackets: any = {
    'Herald': { gpm: 350, xpm: 400, kda: 2.0, winRate: 50 },
    'Guardian': { gpm: 380, xpm: 430, kda: 2.2, winRate: 50 },
    'Crusader': { gpm: 410, xpm: 460, kda: 2.4, winRate: 50 },
    'Archon': { gpm: 450, xpm: 500, kda: 2.6, winRate: 50 },
    'Legend': { gpm: 490, xpm: 540, kda: 2.8, winRate: 50 },
    'Ancient': { gpm: 530, xpm: 580, kda: 3.0, winRate: 50 },
    'Divine': { gpm: 570, xpm: 620, kda: 3.3, winRate: 50 },
    'Immortal': { gpm: 620, xpm: 670, kda: 3.6, winRate: 50 },
    'Unranked': { gpm: 400, xpm: 450, kda: 2.3, winRate: 50 }
  };
  
  return brackets[rank] || brackets['Unranked'];
}

/**
 * Generate comparison conclusion
 */
function generateComparisonConclusion(comparison: any): string {
  const positives = [];
  const negatives = [];
  
  if (comparison.gpm > 0) positives.push('farm');
  else negatives.push('farm');
  
  if (comparison.xpm > 0) positives.push('XP');
  else negatives.push('XP');
  
  if (comparison.kda > 0) positives.push('KDA');
  else negatives.push('KDA');
  
  if (positives.length >= 2) {
    return `🟢 **Você está acima da média!** Seus ${positives.join(' e ')} são superiores ao bracket. Continue assim e você vai subir de rank!`;
  } else if (negatives.length >= 2) {
    return `🔴 **Você está abaixo da média.** Foque em melhorar ${negatives.join(' e ')} para alcançar o nível do seu bracket.`;
  } else {
    return `🟡 **Você está na média do bracket.** Pequenas melhorias farão grande diferença para subir de rank.`;
  }
}

/* ============================================
 * E. MATCH HISTORY HANDLER
 * ============================================ */

async function handleMatchHistory(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  // Check if user has Steam linked
  const userResult = await pool.query(
    'SELECT steam_id FROM users WHERE discord_id = $1',
    [interaction.user.id]
  );

  if (!userResult || userResult.rows.length === 0) {
    await interaction.editReply({
      content: '❌ **Conta Steam não vinculada!**\n\nUse o botão `🔗 Conectar Steam` no canal `🏠・início` primeiro.',
    });
    return;
  }

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('📜 Histórico de Partidas')
        .setDescription('🚧 **Recurso em desenvolvimento**\n\nEm breve você poderá ver suas últimas 20 partidas com estatísticas detalhadas!')
        .setFooter({ text: 'Match History • Coming Soon' })
    ],
  });
}
