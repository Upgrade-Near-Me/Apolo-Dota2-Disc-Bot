/**
 * Rank Tracker Service - MMR History and Progression
 * 
 * Provides:
 * - MMR tracking over time
 * - Rank progression analysis
 * - Win/loss streaks
 * - Seasonal statistics
 */

export interface RankHistory {
  date: Date;
  mmr: number;
  rank: string;
  change: number; // +50, -30, etc
  winrate: number;
}

export interface RankProgress {
  current_mmr: number;
  current_rank: string;
  previous_mmr: number;
  previous_rank: string;
  mmr_change: number;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  streak: {
    type: 'win' | 'loss';
    count: number;
  };
  peak_mmr_session: number;
  lowest_mmr_session: number;
}

export interface RankChart {
  labels: string[]; // dates or match numbers
  mmr_data: number[];
  rank_data: string[];
  average_mmr: number;
  trend: 'upward' | 'downward' | 'stable';
}

/**
 * MMR rank brackets
 */
const RANK_BRACKETS: Array<{ min: number; max: number; name: string; color: string }> = [
  { min: 0, max: 770, name: 'Herald', color: '#92A515' },
  { min: 771, max: 1540, name: 'Guardian', color: '#A06B2D' },
  { min: 1541, max: 2310, name: 'Crusader', color: '#FFFFFF' },
  { min: 2311, max: 3080, name: 'Archon', color: '#B7CEFF' },
  { min: 3081, max: 3850, name: 'Legend', color: '#A335EE' },
  { min: 3851, max: 4620, name: 'Ancient', color: '#EB4B4B' },
  { min: 4621, max: 5420, name: 'Divine', color: '#FFDA03' },
  { min: 5421, max: 10000, name: 'Immortal', color: '#C23C2A' },
];

/**
 * Get rank name from MMR
 */
export function getRankFromMMR(mmr: number): string {
  const bracket = RANK_BRACKETS.find(b => mmr >= b.min && mmr <= b.max);
  return bracket?.name || 'Unknown';
}

/**
 * Get rank color from MMR
 */
export function getRankColorFromMMR(mmr: number): string {
  const bracket = RANK_BRACKETS.find(b => mmr >= b.min && mmr <= b.max);
  return bracket?.color || '#FFFFFF';
}

/**
 * Calculate rank progress
 */
export function calculateRankProgress(
  currentMMR: number,
  previousMMR: number,
  wins: number,
  losses: number,
  winStreak: number = 0,
  lossStreak: number = 0
): RankProgress {
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const mmrChange = currentMMR - previousMMR;

  const streakType = winStreak > lossStreak ? ('win' as const) : ('loss' as const);
  const streakCount = Math.max(winStreak, lossStreak);

  return {
    current_mmr: currentMMR,
    current_rank: getRankFromMMR(currentMMR),
    previous_mmr: previousMMR,
    previous_rank: getRankFromMMR(previousMMR),
    mmr_change: mmrChange,
    games_played: totalGames,
    wins,
    losses,
    win_rate: Math.round(winRate * 100) / 100,
    streak: {
      type: streakType,
      count: streakCount,
    },
    peak_mmr_session: currentMMR,
    lowest_mmr_session: Math.min(currentMMR, previousMMR),
  };
}

/**
 * Generate rank chart data
 */
export function generateRankChart(
  mmrHistory: RankHistory[],
  labels: string[] = []
): RankChart {
  if (mmrHistory.length === 0) {
    return {
      labels: [],
      mmr_data: [],
      rank_data: [],
      average_mmr: 0,
      trend: 'stable',
    };
  }

  const mmrData = mmrHistory.map(h => h.mmr);
  const rankData = mmrHistory.map(h => h.rank);

  const averageMMR = Math.round(
    mmrData.reduce((a, b) => a + b, 0) / mmrData.length
  );

  // Determine trend
  const firstHalf = mmrData.slice(0, Math.floor(mmrData.length / 2));
  const secondHalf = mmrData.slice(Math.floor(mmrData.length / 2));
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  let trend: 'upward' | 'downward' | 'stable' = 'stable';
  if (avgSecond > avgFirst + 100) trend = 'upward';
  else if (avgSecond < avgFirst - 100) trend = 'downward';

  return {
    labels: labels.length === mmrHistory.length ? labels : mmrHistory.map((_, i) => `Game ${i + 1}`),
    mmr_data: mmrData,
    rank_data: rankData,
    average_mmr: averageMMR,
    trend,
  };
}

/**
 * Get rank progression insights
 */
export function getRankInsights(progress: RankProgress) {
  const insights: string[] = [];

  // MMR insights
  if (progress.mmr_change > 200) {
    insights.push('🔥 On fire! Great MMR gains this session.');
  } else if (progress.mmr_change > 0) {
    insights.push('📈 Positive MMR gains! Keep it up.');
  } else if (progress.mmr_change > -100) {
    insights.push('⚠️ Minor MMR loss. Focus and learn from mistakes.');
  } else {
    insights.push('📉 Significant MMR loss. Take a break and reflect.');
  }

  // Win rate insights
  if (progress.win_rate >= 60) {
    insights.push('✅ Excellent win rate! You\'re climbing fast.');
  } else if (progress.win_rate >= 50) {
    insights.push('✔️ Positive win rate. Consistent performance.');
  } else if (progress.win_rate >= 40) {
    insights.push('⚠️ Below 50% win rate. Focus on fundamentals.');
  }

  // Streak insights
  if (progress.streak.type === 'win' && progress.streak.count >= 3) {
    insights.push(`🎯 ${progress.streak.count}-game win streak! Momentum is key.`);
  } else if (progress.streak.type === 'loss' && progress.streak.count >= 3) {
    insights.push(`❌ ${progress.streak.count}-game loss streak. Take a break!`);
  }

  // Rank progress
  if (progress.current_rank !== progress.previous_rank) {
    insights.push(`🏆 Rank promotion! You reached ${progress.current_rank}!`);
  }

  return insights;
}

/**
 * Get next rank MMR requirement
 */
export function getNextRankRequirement(currentMMR: number) {
  const currentRank = getRankFromMMR(currentMMR);
  const currentBracket = RANK_BRACKETS.find(b => b.name === currentRank);

  if (!currentBracket) return null;

  const nextBracket = RANK_BRACKETS.find(b => b.min > currentBracket.max);
  if (!nextBracket) return null;

  const mmrtoNextRank = nextBracket.min - currentMMR;
  const percentProgress = ((currentMMR - currentBracket.min) / (currentBracket.max - currentBracket.min)) * 100;

  return {
    current_rank: currentRank,
    next_rank: nextBracket.name,
    mmr_required: mmrtoNextRank,
    progress_percent: Math.min(percentProgress, 100),
    bracket_min: currentBracket.min,
    bracket_max: currentBracket.max,
  };
}

/**
 * Estimate rank after N wins/losses
 */
export function estimateRankProgress(
  currentMMR: number,
  winsPlanned: number,
  lossesPlanned: number,
  avgMMRGainPerWin: number = 25,
  avgMMRLossPerLoss: number = 25
) {
  const projectedMMR = currentMMR +
    (winsPlanned * avgMMRGainPerWin) -
    (lossesPlanned * avgMMRLossPerLoss);

  const currentRank = getRankFromMMR(currentMMR);
  const projectedRank = getRankFromMMR(projectedMMR);

  return {
    current_mmr: currentMMR,
    current_rank: currentRank,
    projected_mmr: Math.max(0, projectedMMR),
    projected_rank: projectedRank,
    rank_change: currentRank !== projectedRank ? `${currentRank} → ${projectedRank}` : 'No change',
    mmr_change: projectedMMR - currentMMR,
  };
}


