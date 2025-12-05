/**
 * MODAL SUBMISSION HANDLER
 * Handles all modal form submissions from the V2.0 Dashboard
 * 
 * @version 2.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  ModalSubmitInteraction,
  EmbedBuilder,
  ChannelType,
  TextChannel,
  PermissionFlagsBits,
} from 'discord.js';

import pool from '../database/index.js';
import { tInteraction, resolveLocale } from '../utils/i18n.js';

/**
 * Main modal submission router
 */
export async function handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const modalId = interaction.customId;

  // ============================================
  // CONTENT CREATOR MODALS
  // ============================================

  if (modalId === 'modal_stream_announce') {
    await handleStreamAnnounceSubmit(interaction);
    return;
  }

  if (modalId === 'modal_social_links') {
    await handleSocialLinksSubmit(interaction);
    return;
  }

  if (modalId === 'modal_submit_clip') {
    await handleSubmitClipSubmit(interaction);
    return;
  }

  // ============================================
  // HERO BUILD MODAL
  // ============================================

  if (modalId === 'modal_hero_build') {
    await handleHeroBuildSubmit(interaction);
    return;
  }

  // Unknown modal - ignore silently
  console.log(`⚠️ Unknown modal submission: ${modalId}`);
}

/* ============================================
 * STREAM ANNOUNCE HANDLER
 * ============================================ */

async function handleStreamAnnounceSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const streamTitle = interaction.fields.getTextInputValue('stream_title');
  const streamLink = interaction.fields.getTextInputValue('stream_link');
  const streamDesc = interaction.fields.getTextInputValue('stream_desc') || 'Vem jogar comigo!';

  // Validate URL
  if (!streamLink.includes('twitch.tv') && !streamLink.includes('youtube.com')) {
    await interaction.editReply({
      content: '❌ **Link inválido!**\n\nUse um link do Twitch ou YouTube.',
    });
    return;
  }

  // Find or create #lives-on channel
  let announcementChannel = interaction.guild?.channels.cache.find(
    (ch) => ch.name === 'lives-on' && ch.type === ChannelType.GuildText
  ) as TextChannel | undefined;

  if (!announcementChannel) {
    // Create the channel if it doesn't exist
    try {
      announcementChannel = await interaction.guild?.channels.create({
        name: 'lives-on',
        type: ChannelType.GuildText,
        topic: '🎥 Anúncios de Lives da Comunidade',
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          },
        ],
      }) as TextChannel;
    } catch (error) {
      console.error('Error creating #lives-on channel:', error);
      await interaction.editReply({
        content: '❌ **Erro ao criar canal #lives-on**\n\nVerifique se o bot tem permissão `Gerenciar Canais`.',
      });
      return;
    }
  }

  // Detect platform
  const platform = streamLink.includes('twitch.tv') ? 'Twitch' : 'YouTube';
  const platformEmoji = platform === 'Twitch' ? '🟣' : '🔴';

  // Create announcement embed
  const announceEmbed = new EmbedBuilder()
    .setColor(platform === 'Twitch' ? '#9146FF' : '#FF0000')
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTitle(`${platformEmoji} ${streamTitle}`)
    .setDescription(`**${streamDesc}**\n\n🔗 [Assistir Agora](${streamLink})`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
    .setFooter({ text: `Live no ${platform} • APOLO Content Hub` })
    .setTimestamp();

  try {
    await announcementChannel.send({
      content: '@here 🎥 **Nova Live On!**',
      embeds: [announceEmbed],
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Live Anunciada com Sucesso!')
          .setDescription(`Seu anúncio foi postado em <#${announcementChannel.id}>!\n\n🎮 **Boa live!**`)
          .setFooter({ text: 'APOLO Content Hub' })
      ],
    });
  } catch (error) {
    console.error('Error sending stream announcement:', error);
    await interaction.editReply({
      content: '❌ **Erro ao postar anúncio.**\n\nVerifique se o bot tem permissão para enviar mensagens no canal.',
    });
  }
}

/* ============================================
 * SOCIAL LINKS HANDLER
 * ============================================ */

async function handleSocialLinksSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const twitch = interaction.fields.getTextInputValue('social_twitch') || null;
  const youtube = interaction.fields.getTextInputValue('social_youtube') || null;
  const twitter = interaction.fields.getTextInputValue('social_twitter') || null;

  if (!twitch && !youtube && !twitter) {
    await interaction.editReply({
      content: '❌ **Nenhuma rede social fornecida!**\n\nPreencha ao menos um campo.',
    });
    return;
  }

  // Save to database
  try {
    await pool.query(
      `INSERT INTO user_socials (discord_id, twitch, youtube, twitter, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (discord_id) 
       DO UPDATE SET twitch = $2, youtube = $3, twitter = $4, updated_at = NOW()`,
      [interaction.user.id, twitch, youtube, twitter]
    );

    const socialList = [
      twitch ? `🟣 **Twitch:** ${twitch}` : null,
      youtube ? `🔴 **YouTube:** ${youtube}` : null,
      twitter ? `🐦 **Twitter/X:** ${twitter}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00d9ff')
          .setTitle('✅ Redes Sociais Salvas!')
          .setDescription(`**Suas redes foram atualizadas:**\n\n${socialList}\n\n📱 Outros jogadores podem vê-las no seu perfil!`)
          .setFooter({ text: 'APOLO Content Hub' })
      ],
    });
  } catch (error) {
    console.error('Error saving social links:', error);
    await interaction.editReply({
      content: '❌ **Erro ao salvar redes sociais.**\n\nTente novamente mais tarde.',
    });
  }
}

/* ============================================
 * SUBMIT CLIP HANDLER
 * ============================================ */

async function handleSubmitClipSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const clipTitle = interaction.fields.getTextInputValue('clip_title');
  const clipLink = interaction.fields.getTextInputValue('clip_link');
  const clipDesc = interaction.fields.getTextInputValue('clip_desc') || 'Jogada épica!';

  // Validate URL
  if (!clipLink.startsWith('http')) {
    await interaction.editReply({
      content: '❌ **Link inválido!**\n\nForneça uma URL completa (começando com https://).',
    });
    return;
  }

  // Find or create #clips channel
  let clipsChannel = interaction.guild?.channels.cache.find(
    (ch) => ch.name === 'clips' && ch.type === ChannelType.GuildText
  ) as TextChannel | undefined;

  if (!clipsChannel) {
    try {
      clipsChannel = await interaction.guild?.channels.create({
        name: 'clips',
        type: ChannelType.GuildText,
        topic: '📹 Clips épicos da comunidade',
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          },
        ],
      }) as TextChannel;
    } catch (error) {
      console.error('Error creating #clips channel:', error);
      await interaction.editReply({
        content: '❌ **Erro ao criar canal #clips**\n\nVerifique se o bot tem permissão `Gerenciar Canais`.',
      });
      return;
    }
  }

  // Create clip embed
  const clipEmbed = new EmbedBuilder()
    .setColor('#e74c3c')
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTitle(`📹 ${clipTitle}`)
    .setDescription(`**${clipDesc}**\n\n🔗 [Assistir Clip](${clipLink})`)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
    .setFooter({ text: 'APOLO Content Hub • Clips' })
    .setTimestamp();

  try {
    await clipsChannel.send({
      embeds: [clipEmbed],
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Clip Enviado com Sucesso!')
          .setDescription(`Seu clip foi postado em <#${clipsChannel.id}>!\n\n🎬 **Jogada épica!**`)
          .setFooter({ text: 'APOLO Content Hub' })
      ],
    });
  } catch (error) {
    console.error('Error sending clip:', error);
    await interaction.editReply({
      content: '❌ **Erro ao postar clip.**\n\nVerifique se o bot tem permissão para enviar mensagens no canal.',
    });
  }
}

/* ============================================
 * HERO BUILD HANDLER
 * ============================================ */

async function handleHeroBuildSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  const heroName = interaction.fields.getTextInputValue('hero_name');

  // Normalize hero name
  const normalizedHero = heroName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  // Mock build data (in production, fetch from OpenDota/Stratz)
  const buildData = {
    hero: heroName,
    core_items: [
      'Power Treads',
      'Battle Fury',
      'Black King Bar',
      'Manta Style',
      'Abyssal Blade',
    ],
    situational_items: ['Butterfly', 'Satanic', 'Divine Rapier', 'Monkey King Bar'],
    starting_items: ['Tango', 'Quelling Blade', 'Branches', 'Slippers of Agility'],
  };

  const coreItemsList = buildData.core_items.map((item, i) => `${i + 1}. ${item}`).join('\n');
  const situationalList = buildData.situational_items.join(', ');
  const startingList = buildData.starting_items.join(', ');

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle(`🛠️ Build Guide - ${heroName}`)
        .setDescription(`**Build recomendada para ${heroName}**\n\n📦 **Starting Items:**\n${startingList}\n\n⚔️ **Core Items:**\n${coreItemsList}\n\n🎯 **Situational:**\n${situationalList}`)
        .setThumbnail(`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${normalizedHero}.png`)
        .setFooter({ text: 'Build Guide • Patch 7.37 • APOLO Dota 2' })
        .setTimestamp()
    ],
  });
}
