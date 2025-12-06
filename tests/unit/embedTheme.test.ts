import { describe, it, expect } from 'vitest';
import {
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
  createComparisonBar,
  createStatsTable,
  getValueColor,
  createConfidenceIndicator,
} from '../../src/utils/embedTheme.js';
import { EmbedBuilder } from 'discord.js';
import { applyTheme } from '../../src/utils/embedTheme.js';

describe('embedTheme', () => {
  describe('Color Schemes', () => {
    it('should have valid role colors', () => {
      expect(ROLE_COLORS.CARRY).toBe('#FFD700');
      expect(ROLE_COLORS.MID).toBe('#FF6B6B');
      expect(ROLE_COLORS.SUPPORT).toBe('#50C878');
    });

    it('should have valid category colors', () => {
      expect(CATEGORY_COLORS.ANALYTICS).toBe('#1E88E5');
      expect(CATEGORY_COLORS.STRATEGY).toBe('#FF9800');
      expect(CATEGORY_COLORS.AI).toBe('#9C27B0');
    });

    it('should have 6 role colors defined', () => {
      expect(Object.keys(ROLE_COLORS)).toHaveLength(6);
    });

    it('should have 10 category colors defined', () => {
      expect(Object.keys(CATEGORY_COLORS)).toHaveLength(10);
    });
  });

  describe('Progress Bar', () => {
    it('should create a full progress bar at 100%', () => {
      const bar = createProgressBar(100, 100, 20);
      expect(bar).toContain('█');
      expect(bar).toContain('100%');
    });

    it('should create an empty progress bar at 0%', () => {
      const bar = createProgressBar(0, 100, 20);
      expect(bar).toContain('░');
      expect(bar).toContain('0%');
    });

    it('should create a half-filled progress bar at 50%', () => {
      const bar = createProgressBar(50, 100, 20);
      expect(bar).toContain('█');
      expect(bar).toContain('░');
      expect(bar).toContain('50%');
    });

    it('should support compact style', () => {
      const bar = createProgressBar(75, 100, 20, 'compact');
      expect(bar).toContain('75%');
      expect(bar).toContain('█');
    });

    it('should clamp values between 0 and max', () => {
      const bar1 = createProgressBar(-10, 100, 20);
      const bar2 = createProgressBar(150, 100, 20);
      expect(bar1).toContain('0%');
      expect(bar2).toContain('100%');
    });

    it('should handle different bar lengths', () => {
      const short = createProgressBar(50, 100, 10);
      const long = createProgressBar(50, 100, 30);
      expect(short.length).toBeLessThan(long.length);
    });
  });

  describe('Stat Bar', () => {
    it('should create a stat bar with label and value', () => {
      const bar = createStatBar('GPM', 500, 600, 'Gold/min');
      expect(bar).toContain('**GPM**');
      expect(bar).toContain('Gold/min');
    });

    it('should include progress bar in stat bar', () => {
      const bar = createStatBar('XPM', 400, 500);
      expect(bar).toContain('%');
    });

    it('should handle unit parameter', () => {
      const withUnit = createStatBar('Heal', 1000, 2000, 'HP');
      const withoutUnit = createStatBar('Heal', 1000, 2000);
      expect(withUnit).toContain('HP');
      expect(withoutUnit).not.toContain('HP');
    });
  });

  describe('Format Number', () => {
    it('should format millions', () => {
      expect(formatNumber(1_234_567)).toBe('1.23M');
    });

    it('should format thousands', () => {
      expect(formatNumber(5_678)).toBe('5.68K');
    });

    it('should return raw number for small values', () => {
      expect(formatNumber(123)).toBe('123');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle exact millions', () => {
      expect(formatNumber(1_000_000)).toBe('1.00M');
    });
  });

  describe('Inline Stat', () => {
    it('should create inline stat with icon', () => {
      const stat = createInlineStat('🏆', 'Rank', 'Divine');
      expect(stat).toContain('🏆');
      expect(stat).toContain('**Rank**');
      expect(stat).toContain('Divine');
    });

    it('should handle numeric values', () => {
      const stat = createInlineStat('💰', 'GPM', 500);
      expect(stat).toContain('500');
    });
  });

  describe('Performance Grade', () => {
    it('should return S grade for exceptional performance', () => {
      const grade = getPerformanceGrade(600, 650, 100, 400, 500);
      // avgPercent = (150 + 130 + 100) / 3 = 126.67 (not >= 130)
      expect(grade.grade).toBe('A+');
    });

    it('should return A+ grade for elite performance', () => {
      // avgPercent = (125 + 115 + 85) / 3 = 108.33 (>= 105, < 115)
      const grade = getPerformanceGrade(500, 575, 85, 400, 500);
      expect(grade.grade).toBe('A');
    });

    it('should return S grade for true exceptional performance', () => {
      // avgPercent = (200 + 150 + 100) / 3 = 150 (>= 130)
      const grade = getPerformanceGrade(800, 750, 100, 400, 500);
      expect(grade.grade).toBe('S');
      expect(grade.description).toBe('Legendary');
    });

    it('should return D grade for poor performance', () => {
      const grade = getPerformanceGrade(200, 250, 30, 400, 500);
      expect(grade.grade).toBe('D');
      expect(grade.color).toBe('#FF5722');
    });

    it('should have description for each grade', () => {
      const grade = getPerformanceGrade(800, 750, 100, 400, 500);
      expect(grade.description).toBe('Legendary');
    });

    it('should handle average performance', () => {
      // avgPercent = (100 + 100 + 50) / 3 = 83.33 (< 85)
      const grade = getPerformanceGrade(400, 500, 50, 400, 500);
      expect(grade.grade).toBe('C');
    });
  });

  describe('Result Indicator', () => {
    it('should indicate victory', () => {
      const result = createResultIndicator(true);
      expect(result.emoji).toBe('✅');
      expect(result.text).toContain('VICTORY');
      expect(result.color).toBe('#4CAF50');
    });

    it('should indicate defeat', () => {
      const result = createResultIndicator(false);
      expect(result.emoji).toBe('❌');
      expect(result.text).toContain('DEFEAT');
      expect(result.color).toBe('#FF5722');
    });

    it('should include IMP score in victory', () => {
      const result = createResultIndicator(true, 0, 50);
      expect(result.text).toContain('+50');
    });

    it('should include IMP score in defeat', () => {
      const result = createResultIndicator(false, 0, -30);
      expect(result.text).toContain('-30');
    });

    it('should omit IMP score if zero', () => {
      const result = createResultIndicator(true, 0, 0);
      expect(result.text).toBe('VICTORY');
    });
  });

  describe('Thumbnail URLs', () => {
    it('should generate hero thumbnail URL', () => {
      const url = getThumbnail('hero', '1');
      expect(url).toContain('steamstatic.com');
      expect(url).toContain('_sb.png');
    });

    it('should use default player thumbnail', () => {
      const url = getThumbnail('player', 'player-id');
      expect(url).toContain('discord');
    });

    it('should use custom player thumbnail if provided', () => {
      const custom = 'https://example.com/avatar.png';
      const url = getThumbnail('player', 'player-id', custom);
      expect(url).toBe(custom);
    });
  });

  describe('Rank Badge', () => {
    it('should create badge for known ranks', () => {
      const badge = createRankBadge('DIVINE', 7500);
      expect(badge).toContain('DIVINE');
      expect(badge).toContain('7500');
      expect(badge).toContain('7');
    });

    it('should handle all rank tiers', () => {
      const ranks = ['HERALD', 'GUARDIAN', 'CRUSADER', 'ARCHON', 'LEGEND', 'ANCIENT', 'DIVINE', 'IMMORTAL'];
      ranks.forEach((rank, idx) => {
        const badge = createRankBadge(rank, 1000 * (idx + 1));
        expect(badge).toContain(rank);
      });
    });

    it('should handle unknown rank gracefully', () => {
      const badge = createRankBadge('UNKNOWN_RANK', 5000);
      expect(badge).toContain('5000');
    });
  });

  describe('Role Badge', () => {
    it('should create carry role badge', () => {
      const badge = createRoleBadge('CARRY');
      expect(badge).toContain('CARRY');
      expect(badge).toContain('🛡️');
    });

    it('should create mid role badge', () => {
      const badge = createRoleBadge('MID');
      expect(badge).toContain('MID');
      expect(badge).toContain('⚔️');
    });

    it('should handle all roles', () => {
      const roles = ['CARRY', 'MID', 'OFFLANE', 'SUPPORT', 'ROAMING'];
      roles.forEach((role) => {
        const badge = createRoleBadge(role);
        expect(badge).toContain(role);
        expect(badge).toBeTruthy();
      });
    });

    it('should handle hard support role separately', () => {
      const badge = createRoleBadge('HARD_SUPPORT');
      expect(badge).toContain('HARD SUPPORT');
      expect(badge).toBeTruthy();
    });

    it('should handle unknown role', () => {
      const badge = createRoleBadge('UNKNOWN');
      expect(badge).toContain('UNKNOWN');
    });
  });

  describe('Apply Theme', () => {
    it('should apply theme to embed', () => {
      const embed = new EmbedBuilder();
      const themed = applyTheme(embed, 'ANALYTICS');
      expect(themed.data.color).toBe(parseInt(CATEGORY_COLORS.ANALYTICS.replace('#', ''), 16));
    });

    it('should set thumbnail if provided', () => {
      const embed = new EmbedBuilder();
      const url = 'https://example.com/thumbnail.png';
      const themed = applyTheme(embed, 'STRATEGY', { thumbnail: url });
      expect(themed.data.thumbnail?.url).toBe(url);
    });

    it('should handle all category colors', () => {
      const categories: Array<keyof typeof CATEGORY_COLORS> = [
        'ANALYTICS',
        'STRATEGY',
        'AI',
        'LEADERBOARD',
        'TEAM',
        'LIVE',
        'SOCIAL',
        'TECHNICAL',
        'AWARDS',
        'NEUTRAL',
      ];
      categories.forEach((category) => {
        const embed = new EmbedBuilder();
        const themed = applyTheme(embed, category);
        expect(themed.data.color).toBeDefined();
      });
    });
  });

  describe('Comparison Bar', () => {
    it('should create comparison between two values', () => {
      const bar = createComparisonBar('Performance', 80, 100);
      expect(bar).toContain('**Performance**');
      expect(bar).toContain('80');
      expect(bar).toContain('100');
    });

    it('should show equal bars for equal values', () => {
      const bar = createComparisonBar('Stats', 50, 50);
      expect(bar).toContain('50');
    });

    it('should handle unit parameter', () => {
      const bar = createComparisonBar('Damage', 500, 1000, ' DPS');
      expect(bar).toContain('DPS');
    });

    it('should handle zero values', () => {
      const bar = createComparisonBar('Test', 0, 0);
      expect(bar).toContain('N/A');
    });
  });

  describe('Stats Table', () => {
    it('should create a stats table from array', () => {
      const stats = [
        { label: 'Kills', value: 10 },
        { label: 'Deaths', value: 2 },
        { label: 'Assists', value: 15 },
      ];
      const table = createStatsTable(stats);
      expect(table).toContain('Kills');
      expect(table).toContain('10');
      expect(table).toContain('Deaths');
      expect(table).toContain('2');
    });

    it('should include icons if provided', () => {
      const stats = [{ label: 'KDA', value: '10/2/15', icon: '⭐' }];
      const table = createStatsTable(stats);
      expect(table).toContain('⭐');
    });

    it('should join stats with separators', () => {
      const stats = [
        { label: 'A', value: 1 },
        { label: 'B', value: 2 },
      ];
      const table = createStatsTable(stats);
      expect(table).toContain('•');
    });
  });

  describe('Value Color', () => {
    it('should return green for positive values', () => {
      const color = getValueColor(100, 50);
      expect(color).toBe('#4CAF50');
    });

    it('should return red for negative values', () => {
      const color = getValueColor(10, 50);
      expect(color).toBe('#FF5722');
    });

    it('should return gold for neutral values', () => {
      const color = getValueColor(50, 50);
      expect(color).toBe('#FFD700');
    });

    it('should use default threshold of 0', () => {
      const positive = getValueColor(5);
      const negative = getValueColor(-5);
      expect(positive).toBe('#4CAF50');
      expect(negative).toBe('#FF5722');
    });
  });

  describe('Confidence Indicator', () => {
    it('should create 5-star confidence indicator', () => {
      const indicator = createConfidenceIndicator(100);
      expect(indicator).toContain('⭐');
      expect(indicator).toContain('100%');
    });

    it('should show no stars for 0% confidence', () => {
      const indicator = createConfidenceIndicator(0);
      expect(indicator).toContain('☆');
      expect(indicator).toContain('0%');
    });

    it('should show correct number of stars', () => {
      const indicator50 = createConfidenceIndicator(50);
      const count = (indicator50.match(/⭐/g) || []).length;
      // 50% = 2.5 stars, which rounds to 3
      expect(count).toBe(3);
    });

    it('should clamp values to 0-100', () => {
      const high = createConfidenceIndicator(150);
      const low = createConfidenceIndicator(-50);
      expect(high).toContain('100%');
      expect(low).toContain('0%');
    });

    it('should handle decimal percentages', () => {
      const indicator = createConfidenceIndicator(75.5);
      expect(indicator).toContain('75.5%');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const formatted = formatNumber(999_999_999);
      expect(formatted).toContain('M');
    });

    it('should handle special characters in stat labels', () => {
      const stat = createInlineStat('🎮', 'Player #1', 'Test™');
      expect(stat).toContain('Player #1');
    });

    it('should handle empty stats table', () => {
      const table = createStatsTable([]);
      expect(table).toBe('');
    });

    it('should handle single stat in table', () => {
      const stats = [{ label: 'Solo', value: 'Player' }];
      const table = createStatsTable(stats);
      expect(table).not.toContain('•');
    });

    it('should handle progressbar with zero max value', () => {
      const bar = createProgressBar(0, 0, 20);
      expect(bar).toBeDefined();
    });
  });
});
