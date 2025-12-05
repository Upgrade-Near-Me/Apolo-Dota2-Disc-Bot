/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, type Guild, type Client, type TextChannel } from 'discord.js';
import { t } from './i18n.js';

function strip(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/[^a-z0-9\-\s]/gi, ' ')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function detectSlug(name: string): string | null {
  const s = strip(name);
  const pairs: [string, RegExp][] = [
    ['dashboard', /\bdashboard\b/],
    ['help', /\bhelp\b/],
    ['leaderboard', /leaderboard|ranking|clasificacion/],
    ['match-history', /match-?history|historico|historial/],
    ['meta-trends', /meta-?trends|tendencias-?meta/],
    ['hero-builds', /hero-?builds|builds-?herois|builds-?heroes/],
    ['draft-strategy', /draft-?strategy|estrategia-?draft/],
    ['highlights', /highlights|destaques|destacados/],
    ['stream-schedule', /stream-?schedule|agenda-?stream/],
    ['ai-analyst', /ai-?analyst|analista-?ia|analista-?ia/],
    ['content-ideas', /content-?ideas|ideias-?conteudo|ideas-?contenido/],
  ];
  for (const [slug, re] of pairs) {
    if (re.test(s)) return slug;
  }
  return null;
}

async function upsertPinned(channel: TextChannel, payload: any, client: Client): Promise<void> {
  try {
    const pins = await channel.messages.fetchPinned();
    for (const m of pins.values()) {
      if (m.author?.id === client.user?.id) {
        try { await m.unpin(); } catch {}
        try { await m.delete(); } catch {}
      }
    }
  } catch {}

  const msg = await channel.send(payload);
  try { await msg.pin(); } catch {}
}

function dashboardPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#1e88e5')
    .setTitle(t(guildId, 'dashboard_title'))
    .setDescription(t(guildId, 'dashboard_desc'))
    .addFields(
      { name: t(guildId, 'dashboard_account'), value: '`Connect` `Profile` `Last Match`', inline: true },
      { name: t(guildId, 'dashboard_analytics'), value: '`Progress` `Leaderboard` `Balance`', inline: true },
      { name: t(guildId, 'dashboard_strategy'), value: '`Meta` `Builds` `AI Coach`', inline: true }
    )
    .setFooter({ text: t(guildId, 'dashboard_footer') })
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_connect').setLabel(t(guildId, 'dashboard_btn_connect')).setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('dashboard_profile').setLabel(t(guildId, 'dashboard_btn_profile')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_match').setLabel(t(guildId, 'dashboard_btn_match')).setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_progress').setLabel(t(guildId, 'dashboard_btn_progress')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_leaderboard').setLabel(t(guildId, 'dashboard_btn_leaderboard')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_balance').setLabel(t(guildId, 'dashboard_btn_balance')).setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_meta').setLabel(t(guildId, 'dashboard_btn_meta')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_builds').setLabel(t(guildId, 'dashboard_btn_builds')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_ai').setLabel(t(guildId, 'dashboard_btn_ai')).setStyle(ButtonStyle.Success)
  );
  const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_help').setLabel(t(guildId, 'dashboard_btn_help')).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row1, row2, row3, row4] };
}

function simpleButtonRow(customId: string, label: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(ButtonStyle.Primary)
  );
}

function metaPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#ff9800')
    .setTitle(t(guildId, 'meta_title'))
    .setDescription(t(guildId, 'dashboard_meta_desc') || '')
    .setTimestamp();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_meta').setLabel(t(guildId, 'dashboard_btn_meta')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_builds').setLabel(t(guildId, 'dashboard_btn_builds')).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

function buildsPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#9c27b0')
    .setTitle(t(guildId, 'build_title'))
    .setDescription(t(guildId, 'dashboard_builds_desc') || '')
    .setTimestamp();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_builds').setLabel(t(guildId, 'dashboard_btn_builds')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_meta').setLabel(t(guildId, 'dashboard_btn_meta')).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

function helpPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#1e88e5')
    .setTitle(t(guildId, 'dashboard_help_title'))
    .setDescription(t(guildId, 'dashboard_help_desc'))
    .addFields(
      { name: '1', value: t(guildId, 'dashboard_help_connect') },
      { name: '2', value: t(guildId, 'dashboard_help_stats') },
      { name: '3', value: t(guildId, 'dashboard_help_progress') },
      { name: '4', value: t(guildId, 'dashboard_help_compete') },
      { name: '\u200b', value: t(guildId, 'dashboard_help_tips') }
    )
    .setFooter({ text: t(guildId, 'dashboard_help_footer') })
    .setTimestamp();
  return { embeds: [embed] };
}

function leaderboardPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#ffd700')
    .setTitle(` ${t(guildId, 'dashboard_btn_leaderboard')}`)
    .setDescription(t(guildId, 'dashboard_help_compete'))
    .setTimestamp();
  const row = simpleButtonRow('dashboard_leaderboard', t(guildId, 'dashboard_btn_leaderboard'));
  return { embeds: [embed], components: [row] };
}

function historyPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#4caf50')
    .setTitle(' Match History')
    .setDescription(t(guildId, 'dashboard_help_stats'))
    .setTimestamp();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_match').setLabel(t(guildId, 'dashboard_btn_match')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_progress').setLabel(t(guildId, 'dashboard_btn_progress')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_profile').setLabel(t(guildId, 'dashboard_btn_profile')).setStyle(ButtonStyle.Secondary)
  );
  return { embeds: [embed], components: [row] };
}

function aiPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#00bcd4')
    .setTitle(t(guildId, 'dashboard_ai_title'))
    .setDescription(t(guildId, 'dashboard_ai_desc'))
    .setTimestamp();
  const row = simpleButtonRow('dashboard_ai', t(guildId, 'dashboard_btn_ai'));
  return { embeds: [embed], components: [row] };
}

function draftStrategyPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#e91e63')
    .setTitle(' Draft Strategy')
    .setDescription('Discuta estratégias de draft, counter-picks e composições de time.')
    .addFields(
      { name: ' Counter-Picks', value: 'Identifique counter-picks para heróis específicos', inline: true },
      { name: ' Composições', value: 'Monte times balanceados e sinérgicos', inline: true },
      { name: ' Meta Analysis', value: 'Analise o meta atual e adapte sua estratégia', inline: true }
    )
    .setTimestamp();
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('dashboard_meta').setLabel(t(guildId, 'dashboard_btn_meta')).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('dashboard_builds').setLabel(t(guildId, 'dashboard_btn_builds')).setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

function highlightsPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#ff5722')
    .setTitle(' Highlights & Clips')
    .setDescription('Compartilhe suas melhores jogadas, clips épicos e momentos memoráveis!')
    .addFields(
      { name: ' Rampage', value: 'Compartilhe seus rampages', inline: true },
      { name: ' Plays Épicas', value: 'Jogadas incríveis e clutch moments', inline: true },
      { name: ' Funny Moments', value: 'Momentos engraçados e fails', inline: true }
    )
    .setFooter({ text: ' Dica: Use links do YouTube, Twitch clips ou envie arquivos diretamente' })
    .setTimestamp();
  return { embeds: [embed] };
}

function schedulePayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#673ab7')
    .setTitle(' Stream Schedule')
    .setDescription('Anuncie suas lives, watch parties e eventos especiais.')
    .addFields(
      { name: ' Live Now', value: 'Anuncie quando começar a streamar', inline: true },
      { name: ' Próximas Lives', value: 'Compartilhe sua agenda semanal', inline: true },
      { name: ' Eventos', value: 'Watch parties de torneios', inline: true }
    )
    .setFooter({ text: ' Formato sugerido: [Data/Hora] - [Plataforma] - [Conteúdo]' })
    .setTimestamp();
  return { embeds: [embed] };
}

function contentIdeasPayload(guildId: string): any {
  const embed = new EmbedBuilder()
    .setColor('#009688')
    .setTitle(' Content Ideas')
    .setDescription('Brainstorm de ideias criativas para vídeos, streams e conteúdo.')
    .addFields(
      { name: ' Ideias de Vídeos', value: 'Tutoriais, guias, desafios', inline: true },
      { name: ' Análises', value: 'Reports do meta, tier lists, reviews', inline: true },
      { name: ' Séries', value: 'Rumo ao Imortal, desafios de heróis', inline: true }
    )
    .setFooter({ text: ' Use o AI Coach para gerar ideias baseadas em suas stats' })
    .setTimestamp();
  const row = simpleButtonRow('dashboard_ai', ' AI Coach');
  return { embeds: [embed], components: [row] };
}

export async function refreshMenus(guild: Guild, client: Client): Promise<number> {
  const guildId = guild.id;

  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  const mainCategory = categories.find((c: any) => /apolo\s*dota2/i.test(c.name.replace(/[^a-z0-9 ]/gi, '')));
  if (!mainCategory) return 0;

  const children = guild.channels.cache.filter((c: any) => c.parentId === mainCategory.id && c.type === ChannelType.GuildText);
  const bySlug = new Map<string, TextChannel>();
  for (const ch of children.values()) {
    const textCh = ch as TextChannel;
    const slug = detectSlug(textCh.name) || detectSlug(textCh.topic || '') || null;
    if (slug) bySlug.set(slug, textCh);
  }

  const tasks: Promise<void>[] = [];
  if (bySlug.get('dashboard')) tasks.push(upsertPinned(bySlug.get('dashboard')!, dashboardPayload(guildId), client));
  if (bySlug.get('help')) tasks.push(upsertPinned(bySlug.get('help')!, helpPayload(guildId), client));
  if (bySlug.get('leaderboard')) tasks.push(upsertPinned(bySlug.get('leaderboard')!, leaderboardPayload(guildId), client));
  if (bySlug.get('match-history')) tasks.push(upsertPinned(bySlug.get('match-history')!, historyPayload(guildId), client));
  if (bySlug.get('meta-trends')) tasks.push(upsertPinned(bySlug.get('meta-trends')!, metaPayload(guildId), client));
  if (bySlug.get('hero-builds')) tasks.push(upsertPinned(bySlug.get('hero-builds')!, buildsPayload(guildId), client));
  if (bySlug.get('ai-analyst')) tasks.push(upsertPinned(bySlug.get('ai-analyst')!, aiPayload(guildId), client));
  if (bySlug.get('draft-strategy')) tasks.push(upsertPinned(bySlug.get('draft-strategy')!, draftStrategyPayload(guildId), client));
  if (bySlug.get('highlights')) tasks.push(upsertPinned(bySlug.get('highlights')!, highlightsPayload(guildId), client));
  if (bySlug.get('stream-schedule')) tasks.push(upsertPinned(bySlug.get('stream-schedule')!, schedulePayload(guildId), client));
  if (bySlug.get('content-ideas')) tasks.push(upsertPinned(bySlug.get('content-ideas')!, contentIdeasPayload(guildId), client));

  await Promise.all(tasks);
  return tasks.length;
}
