/**
 * Embed Theme System
 * Standardized color scheme and visual hierarchy for all bot embeds
 * Includes role-based coloring, progress bars, and professional styling
 */

import { EmbedBuilder } from 'discord.js';

/**
 * Dota 2 role-based color scheme
 * Matches hero roles for visual consistency
 */
export const ROLE_COLORS = {
  CARRY: '#FFD700', // Gold - carry dominance
  MID: '#FF6B6B', // Red - midlane aggression
  OFFLANE: '#4A90E2', // Blue - offlane control
  SUPPORT: '#50C878', // Green - support enablement
  HARD_SUPPORT: '#9B59B6', // Purple - hard support
  ROAMING: '#E67E22', // Orange - roaming mobility
} as const;

/**
 * Category-based color scheme for feature areas
 */
export const CATEGORY_COLORS = {
  ANALYTICS: '#1E88E5', // Blue - data/stats
  STRATEGY: '#FF9800', // Orange - meta/builds
  AI: '#9C27B0', // Purple - AI/coaching
  LEADERBOARD: '#FFD700', // Gold - rankings
  TEAM: '#4CAF50', // Green - team balance
  LIVE: '#00BCD4', // Cyan - live/active
  SOCIAL: '#E91E63', // Pink - community
  TECHNICAL: '#FF5722', // Deep orange - technical
  AWARDS: '#673AB7', // Deep purple - achievements
  NEUTRAL: '#00D9FF', // Cyan - default/neutral
} as const;

/**
 * Progress bar visual representation
 * Creates a visual bar for Discord embeds (no actual graphics)
 */
export function createProgressBar(
  value: number,
  max: number = 100,
  barLength: number = 20,
  style: 'standard' | 'compact' = 'standard'
): string {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const filledLength = Math.round((barLength / 100) * percentage);
  const emptyLength = barLength - filledLength;

  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);
  const bar = `${filled}${empty}`;

  if (style === 'compact') {
    return `\`${bar}\` ${Math.round(percentage)}%`;
  }

  return `\`${bar}\` ${Math.round(percentage)}% (${value}/${max})`;
}

/**
 * Create a stat bar for embed fields
 * Shows two related statistics side by side with progress indicators
 */
export function createStatBar(label: string, value: number, max: number, unit: string = ''): string {
  const bar = createProgressBar(value, max, 15, 'compact');

  return `**${label}**: ${bar} ${unit ? `(${unit})` : ''}`;
}

/**
 * Format large numbers for readability
 * 1234567 → 1.23M
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  return num.toString();
}

/**
 * Create inline stat display
 * Perfect for profile cards and match summaries
 */
export function createInlineStat(icon: string, label: string, value: string | number): string {
  return `${icon} **${label}** \`${value}\``;
}

/**
 * Create a performance grade based on score
 * Returns letter grade with color indicator
 */
export function getPerformanceGrade(
  gpm: number,
  xpm: number,
  kaScore: number,
  avgGpm: number,
  avgXpm: number
): { grade: string; color: string; description: string } {
  // Calculate percentile scores
  const gpmPercentile = (gpm / avgGpm) * 100;
  const xpmPercentile = (xpm / avgXpm) * 100;
  const avgPercentile = (gpmPercentile + xpmPercentile + kaScore) / 3;

  if (avgPercentile >= 130) {
    return { grade: 'S', color: '#FFD700', description: 'Legendary' };
  }
  if (avgPercentile >= 115) {
    return { grade: 'A+', color: '#FF6B6B', description: 'Elite' };
  }
  if (avgPercentile >= 105) {
    return { grade: 'A', color: '#FF9800', description: 'Excellent' };
  }
  if (avgPercentile >= 95) {
    return { grade: 'B+', color: '#4CAF50', description: 'Very Good' };
  }
  if (avgPercentile >= 85) {
    return { grade: 'B', color: '#1E88E5', description: 'Good' };
  }
  if (avgPercentile >= 70) {
    return { grade: 'C', color: '#9C27B0', description: 'Average' };
  }
  return { grade: 'D', color: '#FF5722', description: 'Below Average' };
}

/**
 * Create a match result indicator
 * Shows WIN/LOSS with appropriate styling
 */
export function createResultIndicator(
  victory: boolean,
  _duration: number = 0,
  impScore: number = 0
): { emoji: string; text: string; color: string } {
  if (victory) {
    return {
      emoji: '✅',
      text: `VICTORY${impScore ? ` • IMP: +${impScore}` : ''}`,
      color: '#4CAF50',
    };
  }
  return {
    emoji: '❌',
    text: `DEFEAT${impScore ? ` • IMP: ${impScore}` : ''}`,
    color: '#FF5722',
  };
}

/**
 * Create a thumbnail URL for hero/player
 * Fallback to default if not available
 */
export function getThumbnail(type: 'hero' | 'player', id: string, defaultUrl?: string): string {
  if (type === 'hero') {
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${id}_sb.png`;
  }
  // Player avatar - use default if not provided
  return defaultUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
}

/**
 * Create a tier badge for rank
 * Visual representation of MMR brackets
 */
export function createRankBadge(rank: string, mmr: number): string {
  const rankMap: { [key: string]: string } = {
    HERALD: '1',
    GUARDIAN: '2',
    CRUSADER: '3',
    ARCHON: '4',
    LEGEND: '5',
    ANCIENT: '6',
    DIVINE: '7',
    IMMORTAL: '8',
  };

  const tier = rankMap[rank] || '0';
  return `📊 ${rank} ${tier} • ${mmr} MMR`;
}

/**
 * Create hero role badge
 * Colored indicator for hero position
 */
export function createRoleBadge(role: string): string {
  const roleMap: { [key: string]: string } = {
    CARRY: '🛡️ CARRY',
    MID: '⚔️ MID',
    OFFLANE: '🏃 OFFLANE',
    SUPPORT: '💊 SUPPORT',
    HARD_SUPPORT: '🤝 HARD SUPPORT',
    ROAMING: '🚀 ROAMING',
  };

  return roleMap[role] || '❓ UNKNOWN';
}

/**
 * Apply theme colors to an embed
 * Automatically selects color based on category
 */
export function applyTheme(
  embed: EmbedBuilder,
  category: keyof typeof CATEGORY_COLORS,
  options?: {
    thumbnail?: string;
    icon?: string;
  }
): EmbedBuilder {
  embed.setColor(CATEGORY_COLORS[category]);

  if (options?.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }

  if (options?.icon) {
    // Icon can be added to title or other fields if needed
  }

  return embed;
}

/**
 * Create a comparison bar for two values
 * Shows relative strength between two stats
 */
export function createComparisonBar(
  label: string,
  value1: number,
  value2: number,
  unit: string = ''
): string {
  const max = Math.max(value1, value2);
  if (max === 0) return `**${label}**: N/A`;

  const ratio1 = Math.round((value1 / max) * 10);
  const ratio2 = Math.round((value2 / max) * 10);

  const bar1 = '█'.repeat(ratio1) + '░'.repeat(10 - ratio1);
  const bar2 = '█'.repeat(ratio2) + '░'.repeat(10 - ratio2);

  return (
    `**${label}**\n` +
    `\`${bar1}\` ${value1}${unit}\n` +
    `\`${bar2}\` ${value2}${unit}`
  );
}

/**
 * Create a mini stats table
 * Compact view for multiple related stats
 */
export function createStatsTable(
  stats: Array<{ label: string; value: string | number; icon?: string }>
): string {
  return stats
    .map((stat) => {
      const icon = stat.icon ? `${stat.icon} ` : '';
      return `${icon}**${stat.label}**: \`${stat.value}\``;
    })
    .join(' • ');
}

/**
 * Determine color based on numeric value
 * Green for positive, red for negative, yellow for neutral
 */
export function getValueColor(value: number, threshold: number = 0): string {
  if (value > threshold) return '#4CAF50'; // Green
  if (value < threshold) return '#FF5722'; // Red
  return '#FFD700'; // Gold
}

/**
 * Create a confidence indicator
 * Shows reliability of a stat/prediction (0-100%)
 */
export function createConfidenceIndicator(confidence: number): string {
  const confPercent = Math.max(0, Math.min(100, confidence));
  const stars = Math.round(confPercent / 20);
  const emptyStars = 5 - stars;

  return `${'⭐'.repeat(stars)}${'☆'.repeat(emptyStars)} ${confPercent}%`;
}

export default {
  ROLE_COLORS,
  CATEGORY_COLORS,
  createProgressBar,
  createStatBar,
  formatNumber,
  createInlineStat,
  getPerformanceGrade,
  createResultIndicator,
  getThumbnail,
  createRankBadge,
  createRoleBadge,
  applyTheme,
  createComparisonBar,
  createStatsTable,
  getValueColor,
  createConfidenceIndicator,
};
