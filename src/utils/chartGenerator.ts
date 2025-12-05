import { createCanvas } from '@napi-rs/canvas';

const width = 800;
const height = 400;

interface ChartOptions {
  data: number[];
  label?: string;
  yAxisLabel?: string;
  color?: string;
}

/**
 * Generate MMR/GPM progress chart
 * @param options - Chart configuration
 * @returns PNG image buffer
 */
export async function generateProgressChart({ 
  data, 
  label = 'Progress', 
  yAxisLabel = 'Value',
  color = '#3498db' 
}: ChartOptions): Promise<Buffer> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ecf0f1';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`${label} - Last ${data.length} Games`, 40, 40);

  // Calculate chart dimensions
  const padding = 60;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2) - 40;
  const chartX = padding;
  const chartY = padding + 40;

  // Find min/max for scaling
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue || 1;

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = chartY + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(chartX, y);
    ctx.lineTo(chartX + chartWidth, y);
    ctx.stroke();

    // Y-axis labels
    const value = Math.round(maxValue - (valueRange / 5) * i);
    ctx.fillStyle = '#95a5a6';
    ctx.font = '12px Arial';
    ctx.fillText(value.toString(), chartX - 35, y + 4);
  }

  // Draw line chart
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();

  const pointSpacing = chartWidth / (data.length - 1 || 1);

  data.forEach((value, index) => {
    const x = chartX + (pointSpacing * index);
    const normalizedValue = (value - minValue) / valueRange;
    const y = chartY + chartHeight - (normalizedValue * chartHeight);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // Draw point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.stroke();

  // Fill area under line
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
  ctx.lineTo(chartX, chartY + chartHeight);
  ctx.closePath();
  ctx.fillStyle = `${color}33`;
  ctx.fill();

  // Y-axis label
  ctx.fillStyle = '#ecf0f1';
  ctx.font = '14px Arial';
  ctx.save();
  ctx.translate(20, chartY + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yAxisLabel, 0, 0);
  ctx.restore();

  // X-axis labels
  ctx.fillStyle = '#95a5a6';
  ctx.font = '10px Arial';
  data.forEach((_, index) => {
    if (index % Math.ceil(data.length / 10) === 0) {
      const x = chartX + (pointSpacing * index);
      ctx.fillText(`G${index + 1}`, x - 10, chartY + chartHeight + 20);
    }
  });

  return canvas.toBuffer('image/png');
}

/**
 * Generate win rate pie chart
 */
export async function generateWinRateChart(wins: number, losses: number): Promise<Buffer> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, width, height);

  const total = wins + losses;
  const winRate = ((wins / total) * 100).toFixed(1);

  // Title
  ctx.fillStyle = '#ecf0f1';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(`Win Rate: ${winRate}%`, width / 2 - 100, 50);

  // Draw doughnut chart
  const centerX = width / 2;
  const centerY = height / 2 + 20;
  const radius = 120;
  const innerRadius = 70;

  const winAngle = (wins / total) * 2 * Math.PI;

  // Wins slice
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + winAngle);
  ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + winAngle, -Math.PI / 2, true);
  ctx.closePath();
  ctx.fill();

  // Losses slice
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2 + winAngle, -Math.PI / 2 + 2 * Math.PI);
  ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + 2 * Math.PI, -Math.PI / 2 + winAngle, true);
  ctx.closePath();
  ctx.fill();

  // Legend
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(width / 2 - 100, height - 80, 20, 20);
  ctx.fillStyle = '#ecf0f1';
  ctx.font = '16px Arial';
  ctx.fillText(`Wins: ${wins}`, width / 2 - 70, height - 63);

  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(width / 2 + 20, height - 80, 20, 20);
  ctx.fillStyle = '#ecf0f1';
  ctx.fillText(`Losses: ${losses}`, width / 2 + 50, height - 63);

  return canvas.toBuffer('image/png');
}

export default { generateProgressChart, generateWinRateChart };
