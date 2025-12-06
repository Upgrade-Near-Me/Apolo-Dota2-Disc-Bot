/**
 * Dashboard Embed Builder
 * Handles creation of all dashboard embeds
 */

import { EmbedBuilder } from 'discord.js';
import { i18nService } from '../../I18nService.js';
import type { Locale } from '../../types/dota.js';

export function createDashboardEmbed(locale: Locale): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor('#00d9ff') // Cyan Premium
    .setTitle('🎮 APOLO COMMAND CENTER')
    .setDescription(i18nService.t(locale, 'dashboard_title') || 'APOLO Dashboard - Interactive Control Panel')
    .setThumbnail('https://cdn.discordapp.com/app-icons/1234567890/abcdef1234567890abcdef1234567890.png')
    .addFields(
      {
        name: '📊 ANALYTICS & STATS',
        value: '```\n🔗 Connect  │ Connect Steam Account\n👤 Profile │ View Player Statistics  \n📈 Match   │ Analyze Latest Match\n📊 Reports │ Detailed Match Analysis\n```',
        inline: false,
      },
      {
        name: '🎯 META & STRATEGY',
        value: '```\n🎮 Meta    │ Current Meta Heroes\n🛠️ Builds  │ Hero Item Builds\n⚖️ Balance │ Team Balancer\n🔎 Live    │ Live Match Spectate\n```',
        inline: false,
      },
      {
        name: '🤖 AI & COACHING',
        value: '```\n🧠 Coach   │ 8 AI Analysis Tools\n💡 Advise  │ Personalized Tips\n📚 Learn   │ Strategy Guides\n🏆 Awards  │ Achievement System\n```',
        inline: false,
      },
      {
        name: '⚙️ SETTINGS',
        value: '```\n🌍 Language│ EN / PT / ES\n❓ Help    │ Command Information\n🔄 Refresh │ Reload Dashboard\n```',
        inline: false,
      }
    )
    .setFooter({
      text: 'APOLO v2.3 | Dashboard | Click buttons below to interact',
      iconURL: 'https://cdn.discordapp.com/emojis/123456789/abcdef1234567890.png',
    })
    .setTimestamp();

  return embed;
}
