/**
 * ============================================
 * APOLO DASHBOARD - V2.0 SMART SYNC
 * ============================================
 * 
 * IDEMPOTENT SYNCHRONIZATION SYSTEM
 * - Creates structure on first run
 * - Updates existing channels/dashboards on subsequent runs
 * - NO DELETION: Preserves chat history and message IDs
 * - Auto-heals: Recreates missing channels
 * - Smart Update: Edits pinned messages instead of creating new ones
 * 
 * BEHAVIOR:
 * 1. Category: Find or Create
 * 2. Channels: Find or Create + Update Permissions
 * 3. Dashboards: Find Pinned Message → Edit OR Create New
 * 
 * RUN ANYTIME TO SYNC/UPDATE WITHOUT LOSING DATA
 */

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  CategoryChannel,
  TextChannel,
  VoiceChannel,
  OverwriteResolvable,
  Message,
  Guild,
} from 'discord.js';

// ============================================
// HELPER FUNCTIONS - SMART SYNC LOGIC
// ============================================

/**
 * Find or create a category channel (idempotent)
 */
async function syncCategory(
  guild: Guild,
  categoryName: string,
  position: number
): Promise<CategoryChannel> {
  let category = guild.channels.cache.find(
    (ch) => ch.name === categoryName && ch.type === ChannelType.GuildCategory
  ) as CategoryChannel | undefined;

  if (category) {
    console.log(`✅ Category exists: ${categoryName}`);
    return category;
  }

  console.log(`🆕 Creating category: ${categoryName}`);
  category = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    position,
  });

  return category as CategoryChannel;
}

/**
 * Sync a text channel (create or update permissions/topic)
 */
async function syncTextChannel(
  guild: Guild,
  channelName: string,
  parentId: string,
  permissions: OverwriteResolvable[],
  topic?: string
): Promise<TextChannel> {
  let channel = guild.channels.cache.find(
    (ch) => ch.name === channelName && ch.type === ChannelType.GuildText
  ) as TextChannel | undefined;

  if (channel) {
    console.log(`♻️ Updating channel: ${channelName}`);
    
    // Update parent if needed
    if (channel.parentId !== parentId) {
      await channel.setParent(parentId, { lockPermissions: false });
    }

    // Update permissions
    await channel.permissionOverwrites.set(permissions);

    // Update topic if provided
    if (topic && channel.topic !== topic) {
      await channel.setTopic(topic);
    }

    return channel;
  }

  console.log(`🆕 Creating text channel: ${channelName}`);
  channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: parentId,
    permissionOverwrites: permissions,
    topic,
  });

  return channel as TextChannel;
}

/**
 * Sync a voice channel (create or update permissions/limit)
 */
async function syncVoiceChannel(
  guild: any,
  channelName: string,
  parentId: string,
  permissions: OverwriteResolvable[],
  userLimit: number
): Promise<VoiceChannel> {
  let channel = guild.channels.cache.find(
    (ch: any) => ch.name === channelName && ch.type === ChannelType.GuildVoice
  ) as VoiceChannel | undefined;

  if (channel) {
    console.log(`♻️ Updating voice channel: ${channelName}`);
    
    // Update parent if needed
    if (channel.parentId !== parentId) {
      await channel.setParent(parentId, { lockPermissions: false });
    }

    // Update permissions
    await channel.permissionOverwrites.set(permissions);

    // Update user limit
    if (channel.userLimit !== userLimit) {
      await channel.setUserLimit(userLimit);
    }

    return channel;
  }

  console.log(`🆕 Creating voice channel: ${channelName}`);
  channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    parent: parentId,
    permissionOverwrites: permissions,
    userLimit,
  });

  return channel as VoiceChannel;
}

/**
 * Smart Dashboard Sync - Create or Edit pinned message with embed/buttons
 * This is the CORE of idempotent updates
 */
async function syncDashboardMessage(
  channel: TextChannel,
  embed: EmbedBuilder,
  components: ActionRowBuilder<ButtonBuilder>[]
): Promise<void> {
  try {
    // Strategy: Find bot's last message (should be the dashboard)
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(msg => msg.author.bot && msg.author.id === channel.client.user?.id);

    let dashboardMessage: Message | undefined;

    // Try to find existing pinned message from bot
    const pinnedMessages = await channel.messages.fetchPinned();
    dashboardMessage = pinnedMessages.find(
      msg => msg.author.id === channel.client.user?.id
    );

    // If no pinned message, use the last bot message
    if (!dashboardMessage && botMessages.size > 0) {
      dashboardMessage = botMessages.first();
    }

    if (dashboardMessage) {
      // ✅ SMART UPDATE: Edit existing message instead of creating new
      console.log(`♻️ Updating dashboard in ${channel.name}`);
      await dashboardMessage.edit({ embeds: [embed], components });
      
      // Ensure it's pinned
      if (!dashboardMessage.pinned) {
        await dashboardMessage.pin();
      }
    } else {
      // 🆕 CREATE: No existing message found
      console.log(`🆕 Creating dashboard in ${channel.name}`);
      const newMessage = await channel.send({ embeds: [embed], components });
      await newMessage.pin();
    }
  } catch (error) {
    console.error(`❌ Error syncing dashboard in ${channel.name}:`, error);
    // Fallback: Just send a new message
    const newMessage = await channel.send({ embeds: [embed], components });
    await newMessage.pin().catch(() => console.log('Could not pin message'));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName('setup-apolo-structure')
    .setDescription('🔄 Smart Sync: Creates/Updates APOLO Dashboard (Idempotent - Safe to run anytime)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // ========================================
    // PHASE 1: PERMISSION VALIDATION
    // ========================================
    if (!interaction.guild) {
      await interaction.reply({ 
        content: '❌ Este comando só pode ser usado em servidores.', 
        ephemeral: true 
      });
      return;
    }

    const botMember = interaction.guild.members.me;
    if (!botMember) {
      await interaction.reply({ 
        content: '❌ Não foi possível verificar as permissões do bot.', 
        ephemeral: true 
      });
      return;
    }

    const requiredPermissions = [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.MoveMembers,
    ];

    const missingPermissions = requiredPermissions.filter(
      (perm) => !botMember.permissions.has(perm)
    );

    if (missingPermissions.length > 0) {
      await interaction.reply({
        content: `❌ **Permissões Insuficientes**\n\nO bot precisa de:\n• \`Gerenciar Canais\`\n• \`Gerenciar Cargos\`\n• \`Mover Membros\``,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    // ========================================
    // PHASE 2: SMART SYNC MODE DETECTION
    // ========================================
    const existingDashboard = interaction.guild.channels.cache.find(
      (ch) => ch.name === '📊 APOLO DASHBOARD' && ch.type === ChannelType.GuildCategory
    );
    const existingArena = interaction.guild.channels.cache.find(
      (ch) => ch.name === '🔊 APOLO ARENA' && ch.type === ChannelType.GuildCategory
    );

    if (existingDashboard || existingArena) {
      await interaction.editReply({
        content: `🔄 **SMART SYNC MODE ACTIVATED**\n\n♻️ Estrutura existente detectada:\n${existingDashboard ? '• `📊 APOLO DASHBOARD` (8 canais de texto)\n' : ''}${existingArena ? '• `🔊 APOLO ARENA` (3 canais de voz)\n' : ''}\n✅ **SINCRONIZANDO:**\n• Canais ausentes serão criados\n• Canais existentes terão permissões atualizadas\n• Dashboards serão editados (SEM apagar mensagens)\n• Histórico de chat preservado\n\n⏳ Processando...`,
      });
    } else {
      await interaction.editReply({
        content: '🆕 **FIRST-TIME INSTALLATION DETECTED**\n\n✨ Criando estrutura completa do zero...\n⏳ Aguarde ~30 segundos...',
      });
    }

    // ========================================
    // PHASE 3: SYNC TEXT DASHBOARD CATEGORY
    // ========================================
    const textPermissions: OverwriteResolvable[] = [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.SendMessages],
        allow: [PermissionFlagsBits.ViewChannel],
      },
    ];

    const dashboardCategory = await syncCategory(
      interaction.guild,
      '📊 APOLO DASHBOARD',
      0
    );

    // ========================================
    // SYNC ALL TEXT CHANNELS WITH DASHBOARDS
    // ========================================

    // CHANNEL A: 🏠・connect
    const homeChannel = await syncTextChannel(
      interaction.guild,
      '🏠・connect',
      dashboardCategory.id,
      textPermissions,
      'Bem-vindo ao APOLO Dota 2 Bot - Conecte sua conta Steam para começar'
    );

    const homeEmbed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🏠 Bem-vindo ao APOLO Dota 2')
      .setDescription('**Seu assistente tático inteligente para dominar o Dota 2**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**🔗 CONECTE SUA CONTA STEAM:**\n\n' +
        '✅ **Análise de Partidas em Tempo Real**\n' +
        '└─ Relatórios detalhados com estatísticas completas após cada jogo\n\n' +
        '🧠 **Sistema AI Analyst Integrado**\n' +
        '└─ Análise inteligente de performance e dicas personalizadas\n\n' +
        '📊 **Estatísticas Detalhadas**\n' +
        '└─ Acompanhe sua evolução com gráficos e métricas avançadas\n\n' +
        '🏆 **Ranking do Servidor**\n' +
        '└─ Compete com outros jogadores e suba no leaderboard\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '⚡ **Clique no botão abaixo para começar!**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const homeButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_connect').setLabel('🔗 Conectar Steam').setStyle(ButtonStyle.Success)
    );

    await syncDashboardMessage(homeChannel, homeEmbed, [homeButtons]);

    // CHANNEL B: 👤・profile
    const profileChannel = await syncTextChannel(
      interaction.guild,
      '👤・profile',
      dashboardCategory.id,
      textPermissions,
      'Estatísticas e análise de performance do seu perfil Dota 2'
    );

    const profileEmbed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('👤 Estatísticas Pessoais - Perfil do Jogador')
      .setDescription('**Acompanhe toda sua evolução e desempenho no Dota 2**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**📊 VISUALIZE SEU PERFIL COMPLETO:**\n\n' +
        '🏆 **Rank e MMR Atual**\n' +
        '└─ Seu ranking atual e evolução de MMR ao longo do tempo\n\n' +
        '🎯 **Taxa de Vitória**\n' +
        '└─ Win rate geral e por período (últimas 10, 20 e 50 partidas)\n\n' +
        '🦸 **Pool de Heróis**\n' +
        '└─ Top 5 heróis mais jogados com estatísticas detalhadas\n\n' +
        '📈 **Gráficos de Progresso**\n' +
        '└─ Evolução de GPM, XPM e KDA com visualização gráfica\n\n' +
        '⚔️ **Performance Recente**\n' +
        '└─ Análise das últimas partidas com médias e tendências\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '✨ **Dados atualizados em tempo real**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const profileButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_profile').setLabel('👤 Ver Meu Perfil').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('dashboard_progress').setLabel('📈 Ver Progresso').setStyle(ButtonStyle.Secondary)
    );

    await syncDashboardMessage(profileChannel, profileEmbed, [profileButtons]);

    // CHANNEL C: ⚔️・reports
    const matchesChannel = await syncTextChannel(
      interaction.guild,
      '⚔️・reports',
      dashboardCategory.id,
      textPermissions,
      'Histórico completo de partidas com análise detalhada de performance'
    );

    const matchesEmbed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('⚔️ Relatório de Partidas - Análise Detalhada')
      .setDescription('**Reviva cada batalha com análise profunda e métricas avançadas**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**📋 ANÁLISE DE PARTIDAS DISPONÍVEL:**\n\n' +
        '🎨 **Cards Visuais Personalizados**\n' +
        '└─ Relatórios em imagem com design profissional e informações completas\n\n' +
        '📊 **Performance Grade (S-F)**\n' +
        '└─ Sistema de notas baseado em KDA, GPM, XPM e impacto no jogo\n\n' +
        '⚖️ **Comparação com Médias**\n' +
        '└─ Compare seu desempenho com jogadores do mesmo rank\n\n' +
        '💥 **Estatísticas de Combate**\n' +
        '└─ Dano causado, farm acumulado e participação em teamfights\n\n' +
        '📜 **Histórico Completo**\n' +
        '└─ Acesse suas últimas 20 partidas com filtros e estatísticas\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🔍 **Todos os dados são atualizados automaticamente**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const matchesButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_match').setLabel('📊 Última Partida').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('dashboard_match_history').setLabel('📜 Histórico Recente').setStyle(ButtonStyle.Secondary)
    );

    await syncDashboardMessage(matchesChannel, matchesEmbed, [matchesButtons]);

    // CHANNEL D: 🧠・ai-analyst
    const aiCoachChannel = await syncTextChannel(
      interaction.guild,
      '🧠・ai-analyst',
      dashboardCategory.id,
      textPermissions,
      'Sistema profissional de análise de performance e coaching inteligente'
    );

    const aiEmbed = new EmbedBuilder()
      .setColor('#7c3aed')
      .setTitle('🧠 AI Analyst - Sistema de Análise Profissional')
      .setDescription('**Sistema inteligente de análise tática para Dota 2**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**📊 ANÁLISES DISPONÍVEIS:**\n\n' +
        '🎯 **Performance Score**\n' +
        '└─ Avaliação completa com notas de S a F baseadas em suas últimas 10 partidas\n\n' +
        '📈 **Trends Analysis**\n' +
        '└─ Identifica padrões e tendências na sua evolução ao longo do tempo\n\n' +
        '⚠️ **Weakness Detection**\n' +
        '└─ Detecta problemas críticos e pontos que precisam de atenção imediata\n\n' +
        '💪 **Strengths Highlight**\n' +
        '└─ Destaca seus pontos fortes e como capitalizá-los em partidas\n\n' +
        '🦸 **Hero Analysis**\n' +
        '└─ Performance detalhada por herói com estatísticas completas\n\n' +
        '📋 **Full Report**\n' +
        '└─ Relatório 360° com análise completa e plano de ação personalizado\n\n' +
        '⚖️ **Bracket Compare**\n' +
        '└─ Compare suas estatísticas com as médias do seu bracket de MMR\n\n' +
        '💡 **Smart Tips**\n' +
        '└─ Dicas personalizadas baseadas em inteligência artificial\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '✨ **100% Gratuito** • 🚀 **Análise em Tempo Real** • 🎯 **Dados Precisos**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const aiRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_ai_performance')
        .setLabel('Performance Score')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId('dashboard_ai_trends')
        .setLabel('Trends Analysis')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📈'),
      new ButtonBuilder()
        .setCustomId('dashboard_ai_weaknesses')
        .setLabel('Weakness Detection')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️')
    );

    const aiRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_ai_strengths')
        .setLabel('Strengths Highlight')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💪'),
      new ButtonBuilder()
        .setCustomId('dashboard_ai_heroes')
        .setLabel('Hero Analysis')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🦸'),
      new ButtonBuilder()
        .setCustomId('dashboard_ai_report')
        .setLabel('Full Report')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋')
    );

    const aiRow3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('dashboard_ai_compare')
        .setLabel('Bracket Compare')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('⚖️'),
      new ButtonBuilder()
        .setCustomId('dashboard_ai_tip')
        .setLabel('Smart Tips')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💡')
    );

    await syncDashboardMessage(aiCoachChannel, aiEmbed, [aiRow1, aiRow2, aiRow3]);

    // CHANNEL E: 📚・meta-builds
    const metaChannel = await syncTextChannel(
      interaction.guild,
      '📚・meta-builds',
      dashboardCategory.id,
      textPermissions,
      'Biblioteca do meta atual - Builds, heróis em alta e estratégias competitivas'
    );

    const metaEmbed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('📚 Biblioteca do Meta - Builds e Estratégias')
      .setDescription('**Domine o meta atual com as melhores builds e estratégias**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**🎯 EXPLORE O META POR POSIÇÃO:**\n\n' +
        '⚔️ **Meta Carry (Posição 1)**\n' +
        '└─ Top picks, builds core e estratégias de farm para carregar o jogo\n\n' +
        '🔮 **Meta Mid (Posição 2)**\n' +
        '└─ Heróis dominantes no mid, combos de itens e power spikes\n\n' +
        '🛡️ **Meta Offlane (Posição 3)**\n' +
        '└─ Initiators e tanks para controlar teamfights\n\n' +
        '⛑️ **Meta Support (Posições 4 e 5)**\n' +
        '└─ Suportes efetivos, itens de utilidade e posicionamento\n\n' +
        '🛠️ **Buscar Build Personalizada**\n' +
        '└─ Procure builds específicas por herói com recomendações atualizadas\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🔄 **Atualizado constantemente com o patch atual**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const metaRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_meta_carry').setLabel('⚔️ Meta Carry').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dashboard_meta_mid').setLabel('🔮 Meta Mid').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dashboard_meta_off').setLabel('🛡️ Meta Off').setStyle(ButtonStyle.Secondary)
    );

    const metaRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_meta_sup').setLabel('⛑️ Meta Sup').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dashboard_builds').setLabel('🛠️ Buscar Build').setStyle(ButtonStyle.Primary)
    );

    await syncDashboardMessage(metaChannel, metaEmbed, [metaRow1, metaRow2]);

    // CHANNEL F: 🎥・content-hub
    const contentChannel = await syncTextChannel(
      interaction.guild,
      '🎥・content-hub',
      dashboardCategory.id,
      textPermissions,
      'Área do criador - Divulgue suas streams, clips e redes sociais'
    );

    const contentEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🎥 Content Hub - Área do Criador de Conteúdo')
      .setDescription('**Compartilhe seu conteúdo e cresça na comunidade**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**📺 DIVULGUE SEU CONTEÚDO:**\n\n' +
        '🔴 **Anunciar Stream**\n' +
        '└─ Avise quando for fazer live na Twitch, YouTube ou Facebook Gaming\n\n' +
        '🎬 **Compartilhar Clips**\n' +
        '└─ Poste suas jogadas épicas, outplays e momentos engraçados\n\n' +
        '🔗 **Redes Sociais**\n' +
        '└─ Divulgue seus canais do YouTube, TikTok, Instagram e Twitter\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🌟 **Apoie criadores da comunidade e cresça junto!**')
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const contentButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_stream_announce').setLabel('🎥 Divulgar Stream').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('dashboard_social_links').setLabel('📱 Redes Sociais').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dashboard_submit_clip').setLabel('📹 Enviar Clip').setStyle(ButtonStyle.Secondary)
    );

    await syncDashboardMessage(contentChannel, contentEmbed, [contentButtons]);

    // CHANNEL G: 🔎・find-team
    const lfgChannel = await syncTextChannel(
      interaction.guild,
      '🔎・find-team',
      dashboardCategory.id,
      textPermissions,
      'Sistema LFG - Encontre parceiros para jogar ranked ou casual'
    );

    const lfgEmbed = new EmbedBuilder()
      .setColor('#E67E22')
      .setTitle('🔎 Localizador de Partida (LFG)')
      .setDescription(
        '**Encontre parceiros para jogar ranked ou casual!**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**🎯 SISTEMA DE MATCHMAKING**\n' +
        '└─ Busque jogadores pela role preferida (Core/Support)\n' +
        '└─ Filtre por nível de habilidade (Iniciante/Veterano)\n' +
        '└─ Encontre duo partner ou stack completa\n' +
        '└─ Receba notificações quando houver match\n\n' +
        '**👥 ROLES DISPONÍVEIS**\n' +
        '└─ 🛡️ **Core** - Carry, Mid, Offlane\n' +
        '└─ 💊 **Support** - Soft/Hard Support\n\n' +
        '**📊 FILTROS DE SKILL**\n' +
        '└─ 👶 **Iniciante** - Herald até Archon\n' +
        '└─ 🔥 **Veterano** - Legend até Immortal\n\n' +
        '**🔔 NOTIFICAÇÕES**\n' +
        '└─ Alerta quando encontrar jogadores compatíveis\n' +
        '└─ Sistema automático de queue\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    const lfgRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_lfg_core').setLabel('🛡️ Sou Core').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('dashboard_lfg_support').setLabel('💊 Sou Support').setStyle(ButtonStyle.Primary)
    );

    const lfgRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_lfg_beginner').setLabel('👶 Iniciante').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('dashboard_lfg_veteran').setLabel('🔥 Veterano').setStyle(ButtonStyle.Secondary)
    );

    const lfgRow3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('dashboard_lfg_duo').setLabel('🔎 Buscar Duo').setStyle(ButtonStyle.Success)
    );

    await syncDashboardMessage(lfgChannel, lfgEmbed, [lfgRow1, lfgRow2, lfgRow3]);

    // CHANNEL H: 🏆・server-ranking
    const leaderboardChannel = await syncTextChannel(
      interaction.guild,
      '🏆・server-ranking',
      dashboardCategory.id,
      textPermissions,
      'Ranking competitivo do servidor - Top jogadores em 4 categorias'
    );

    const leaderboardEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Ranking do Servidor')
      .setDescription(
        '**Compete com os melhores jogadores da comunidade!**\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**📊 CATEGORIAS DE RANKING**\n\n' +
        '**🎯 MAIOR WIN RATE**\n' +
        '└─ Top 10 jogadores com melhor taxa de vitória\n' +
        '└─ Mínimo de 20 partidas para qualificar\n' +
        '└─ Atualizado em tempo real\n\n' +
        '**💰 MAIOR GPM MÉDIO**\n' +
        '└─ Gold Per Minute - Eficiência de farm\n' +
        '└─ Média calculada das últimas 50 partidas\n' +
        '└─ Indicador de habilidade de core\n\n' +
        '**📈 MAIOR XPM MÉDIO**\n' +
        '└─ Experience Per Minute - Aproveitamento de XP\n' +
        '└─ Média das últimas 50 partidas\n' +
        '└─ Reflete domínio de lane e jungle\n\n' +
        '**🔥 MAIOR WIN STREAK**\n' +
        '└─ Sequência atual de vitórias consecutivas\n' +
        '└─ Hall da fama de streaks históricos\n' +
        '└─ Conquiste o topo e prove sua consistência\n\n' +
        '**⏰ ATUALIZAÇÃO AUTOMÁTICA**\n' +
        '└─ Rankings atualizados a cada hora\n' +
        '└─ Dados sincronizados com OpenDota API\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .setFooter({ text: '🎮 APOLO - Dota2 • Developed by PKT Gamers & Upgrade Near ME' })
      .setTimestamp();

    await syncDashboardMessage(leaderboardChannel, leaderboardEmbed, []);

    // ========================================
    // PHASE 4: SYNC VOICE ARENA CATEGORY
    // ========================================
    const voicePermissions: OverwriteResolvable[] = [
      {
        id: interaction.guild.roles.everyone.id,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ViewChannel],
      },
    ];

    const arenaCategory = await syncCategory(
      interaction.guild,
      '🔊 APOLO ARENA',
      1
    );

    // Voice Channel A: Lobby de Espera
    await syncVoiceChannel(
      interaction.guild,
      '🔊 Lobby de Espera',
      arenaCategory.id,
      voicePermissions,
      0 // Unlimited
    );

    // Voice Channel B: Radiant Team
    await syncVoiceChannel(
      interaction.guild,
      '⚔️ Radiant Team',
      arenaCategory.id,
      voicePermissions,
      5
    );

    // Voice Channel C: Dire Team
    await syncVoiceChannel(
      interaction.guild,
      '🌙 Dire Team',
      arenaCategory.id,
      voicePermissions,
      5
    );

    // ========================================
    // PHASE 5: SUCCESS CONFIRMATION
    // ========================================
    const successEmbed = new EmbedBuilder()
      .setColor('#00d9ff')
      .setTitle('✅ Sincronização Completa!')
      .setDescription(`**APOLO V2.0 Smart Sync Finalizado**\n\n${existingDashboard || existingArena ? '♻️ **MODO ATUALIZAÇÃO:**\n• Canais existentes sincronizados\n• Dashboards atualizados (sem apagar mensagens)\n• Permissões ajustadas\n• Estrutura completa verificada\n\n' : '🆕 **INSTALAÇÃO INICIAL:**\n• Estrutura criada do zero\n• Todos os dashboards instalados\n• Canais de voz prontos\n\n'}📊 **8 Canais de Texto:**\n• 🏠 Início • 👤 Perfil • ⚔️ Partidas • 🧠 AI Coach\n• 📚 Meta & Builds • 🎥 Content Hub • 🔎 LFG • 🏆 Leaderboard\n\n🔊 **3 Canais de Voz:**\n• Lobby de Espera • Radiant Team • Dire Team\n\n✨ **Pronto para uso!** Execute novamente este comando para atualizar dashboards.`)
      .setThumbnail('https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png')
      .setFooter({ text: 'APOLO v2.0 Smart Sync • Run Anytime to Update' })
      .setTimestamp();

    await interaction.editReply({ 
      content: '', 
      embeds: [successEmbed] 
    });
  },
};
