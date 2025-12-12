/**
 * Dashboard Embed Builder
 * Handles creation of all dashboard embeds with professional theming
 */

import { EmbedBuilder } from 'discord.js';
import { i18nService } from '../../I18nService.js';
import { applyTheme, CATEGORY_COLORS, createProgressBar } from '../../utils/embedTheme.js';
import type { Locale } from '../../types/dota.js';

type ThemeCategory = keyof typeof CATEGORY_COLORS;

export function createDashboardEmbed(locale: Locale): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('🎮 APOLO COMMAND CENTER')
    .setDescription(
      i18nService.t(locale, 'dashboard_title') ||
      'APOLO Dashboard - Interactive Control Panel\n\n' +
      'Click buttons below to explore features and analyze your Dota 2 gameplay.'
    )
    .addFields(
      {
        name: '📊 ANALYTICS & STATISTICS',
        value: 
          '🔗 **Connect** - Link your Steam account\n' +
          '👤 **Profile** - View your complete statistics\n' +
          '📈 **Match** - Analyze your latest game\n' +
          '📊 **Reports** - Deep match analysis',
        inline: true,
      },
      {
        name: '🎯 META & STRATEGY',
        value: 
          '🎮 **Meta** - Current meta heroes by position\n' +
          '🛠️ **Builds** - Hero item builds and skill progression\n' +
          '⚖️ **Balance** - Smart team balancer\n' +
          '🔎 **Live** - Spectate live matches',
        inline: true,
      },
      {
        name: '🤖 AI & COACHING',
        value: 
          '🧠 **Coach** - 8 AI analysis tools\n' +
          '💡 **Advise** - Personalized gaming tips\n' +
          '📚 **Learn** - Strategy guides\n' +
          '🏆 **Awards** - Achievement system',
        inline: true,
      },
      {
        name: '⚙️ SETTINGS & HELP',
        value: 
          `${createProgressBar(80, 100, 15, 'compact')}\n` +
          '🌍 **Language** - EN / PT / ES\n' +
          '❓ **Help** - Command information\n' +
          '🔄 **Refresh** - Reload this dashboard',
        inline: true,
      }
    )
    .setFooter({
      text: 'APOLO v2.3 | Dashboard | Enterprise Dota 2 Analysis Platform',
      iconURL: 'https://cdn.discordapp.com/app-icons/1234567890/abcdef1234567890abcdef1234567890.png',
    })
    .setTimestamp();

  return applyTheme(embed, 'NEUTRAL');
}

/**
 * Create a profile embed with comprehensive player statistics
 */
export function createProfileEmbed(
  playerName: string,
  rank: string,
  mmr: number,
  wins: number,
  losses: number,
  avgGpm: number,
  avgXpm: number,
  locale: Locale,
  thumbnailUrl?: string
): EmbedBuilder {
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
  
  const embed = new EmbedBuilder()
    .setTitle(`👤 ${playerName}`)
    .setDescription(
      `**Rank:** ${rank}\n` +
      `**MMR:** ${mmr.toLocaleString()}\n` +
      `**Win Rate:** ${winRate}%`
    )
    .addFields(
      {
        name: '📊 STATISTICS',
        value: 
          `**Matches:** ${totalMatches}\n` +
          `**Wins:** ${wins} ${createProgressBar(wins, totalMatches, 10, 'compact')}\n` +
          `**Losses:** ${losses}\n` +
          `**Avg GPM:** ${avgGpm.toFixed(0)}\n` +
          `**Avg XPM:** ${avgXpm.toFixed(0)}`,
        inline: false,
      }
    )
    .setFooter({ text: 'Last updated just now' })
    .setTimestamp();

  if (thumbnailUrl) {
    embed.setThumbnail(thumbnailUrl);
  }

  return applyTheme(embed, 'ANALYTICS');
}

/**
 * Create a match result embed with detailed analysis
 */
export function createMatchEmbed(
  heroName: string,
  victory: boolean,
  kills: number,
  deaths: number,
  assists: number,
  gpm: number,
  xpm: number,
  duration: string,
  locale: Locale,
  impScore?: number,
  heroThumbnail?: string
): EmbedBuilder {
  const kda = `${kills}/${deaths}/${assists}`;
  const resultColor = victory ? '#4CAF50' : '#FF5722';
  const resultText = victory ? '✅ VICTORY' : '❌ DEFEAT';
  const kaScore = (kills + assists) / Math.max(1, deaths);

  const embed = new EmbedBuilder()
    .setTitle(`${resultText} - ${heroName}`)
    .setDescription(`**KDA:** ${kda} (${kaScore.toFixed(2)})\n**Duration:** ${duration}`)
    .addFields(
      {
        name: '📊 ECONOMY',
        value: 
          `**GPM:** ${gpm.toLocaleString()} ${createProgressBar(gpm, 600, 10, 'compact')}\n` +
          `**XPM:** ${xpm.toLocaleString()} ${createProgressBar(xpm, 600, 10, 'compact')}`,
        inline: true,
      },
      {
        name: '⭐ PERFORMANCE',
        value: 
          `**IMP Score:** ${impScore ? `${impScore > 0 ? '+' : ''}${impScore}` : 'N/A'}\n` +
          `**K/D Ratio:** ${kaScore.toFixed(2)}`,
        inline: true,
      }
    )
    .setColor(resultColor)
    .setFooter({ text: 'Match analysis complete' })
    .setTimestamp();

  if (heroThumbnail) {
    embed.setThumbnail(heroThumbnail);
  }

  return embed;
}

/**
 * Create a leaderboard entry embed
 */
export function createLeaderboardEmbed(
  category: 'wins' | 'gpm' | 'xpm' | 'streak',
  entries: Array<{ rank: number; name: string; value: string | number }>,
  _locale: Locale
): EmbedBuilder {
  const categoryLabels: Record<'wins' | 'gpm' | 'xpm' | 'streak', { emoji: string; title: string; color: ThemeCategory }> = {
    wins: { emoji: '🎯', title: 'Highest Win Rate', color: 'LEADERBOARD' },
    gpm: { emoji: '💰', title: 'Highest GPM Average', color: 'ANALYTICS' },
    xpm: { emoji: '📈', title: 'Highest XPM Average', color: 'ANALYTICS' },
    streak: { emoji: '🔥', title: 'Longest Win Streak', color: 'LEADERBOARD' },
  };

  const config = categoryLabels[category];
  const description = entries
    .map((e) => `**#${e.rank}** ${e.name} - \`${e.value}\``)
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`${config.emoji} ${config.title}`)
    .setDescription(description)
    .setFooter({ text: 'Updates hourly' })
    .setTimestamp();

  return applyTheme(embed, config.color);
}

