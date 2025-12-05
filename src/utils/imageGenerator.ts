import { createCanvas } from '@napi-rs/canvas';

interface MatchData {
  result: 'WIN' | 'LOSS';
  heroName?: string;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  netWorth: number;
  duration: number;
}

interface Performance {
  grade: string;
  kdaRatio: number;
}

/**
 * Generate a match analysis card image
 * @param matchData - Match data object
 * @returns PNG image buffer
 */
export async function generateMatchCard(matchData: MatchData): Promise<Buffer> {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, matchData.result === 'WIN' ? '#2ecc71' : '#e74c3c');
  gradient.addColorStop(1, '#34495e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, 100);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(matchData.result === 'WIN' ? '🏆 VICTORY' : '💀 DEFEAT', 40, 60);

  // Hero name
  ctx.font = 'bold 28px Arial';
  ctx.fillText(matchData.heroName || 'Unknown Hero', 40, 150);

  // KDA Section
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#ecf0f1';
  const kda = `${matchData.kills}/${matchData.deaths}/${matchData.assists}`;
  ctx.fillText(kda, 40, 220);
  
  ctx.font = '20px Arial';
  ctx.fillStyle = '#95a5a6';
  ctx.fillText('K / D / A', 40, 250);

  // Stats boxes
  const stats = [
    { label: 'GPM', value: matchData.gpm, x: 40, y: 320 },
    { label: 'XPM', value: matchData.xpm, x: 220, y: 320 },
    { label: 'Net Worth', value: `${(matchData.netWorth / 1000).toFixed(1)}k`, x: 400, y: 320 },
  ];

  stats.forEach(stat => {
    // Stat box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(stat.x, stat.y, 150, 80);
    
    // Value
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(String(stat.value), stat.x + 20, stat.y + 45);
    
    // Label
    ctx.font = '16px Arial';
    ctx.fillStyle = '#95a5a6';
    ctx.fillText(stat.label, stat.x + 20, stat.y + 65);
  });

  // Performance badge
  const performance = calculatePerformance(matchData);
  ctx.fillStyle = getPerformanceColor(performance.grade);
  ctx.fillRect(width - 150, height - 150, 120, 120);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px Arial';
  ctx.fillText(performance.grade, width - 130, height - 60);

  // Duration
  ctx.fillStyle = '#95a5a6';
  ctx.font = '18px Arial';
  const duration = formatDuration(matchData.duration);
  ctx.fillText(`Duration: ${duration}`, 40, height - 40);

  return canvas.toBuffer('image/png');
}

/**
 * Calculate performance grade based on stats
 */
function calculatePerformance(data: MatchData): Performance {
  const kdaRatio = (data.kills + data.assists) / Math.max(data.deaths, 1);
  
  let grade = 'F';
  if (kdaRatio >= 5) grade = 'S';
  else if (kdaRatio >= 4) grade = 'A';
  else if (kdaRatio >= 3) grade = 'B';
  else if (kdaRatio >= 2) grade = 'C';
  else if (kdaRatio >= 1) grade = 'D';

  return { grade, kdaRatio };
}

/**
 * Get color for performance grade
 */
function getPerformanceColor(grade: string): string {
  const colors: Record<string, string> = {
    'S': '#f39c12',
    'A': '#2ecc71',
    'B': '#3498db',
    'C': '#95a5a6',
    'D': '#e67e22',
    'F': '#e74c3c',
  };
  return colors[grade] || colors['F']!;
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default generateMatchCard;
