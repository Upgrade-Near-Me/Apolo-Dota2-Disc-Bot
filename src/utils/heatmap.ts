import { createCanvas, type SKRSContext2D } from '@napi-rs/canvas';
import type { MatchVision, WardPlacement } from '../services/openDotaService.js';

interface HeatmapLabels {
  title: string;
  matchLabel: string;
  observerLabel: string;
  sentryLabel: string;
}

interface HeatmapPayload {
  matchId: number;
  durationSeconds: number;
  observers: WardPlacement[];
  sentries: WardPlacement[];
}

const MAP_SIZE = 128;
const CANVAS_SIZE = 800;

function toCanvas(value: number): number {
  const clamped = Math.max(0, Math.min(MAP_SIZE, value));
  return (clamped / MAP_SIZE) * CANVAS_SIZE;
}

function drawWard(ctx: SKRSContext2D, ward: WardPlacement, color: string): void {
  const x = toCanvas(ward.x);
  const y = CANVAS_SIZE - toCanvas(ward.y);
  const radius = 26;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `${color}aa`);
  gradient.addColorStop(0.6, `${color}55`);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function generateWardHeatmap(data: HeatmapPayload, labels: HeatmapLabels): Promise<Buffer> {
  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const ctx = canvas.getContext('2d');

  // Background grid
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = '#1f2a44';
  ctx.lineWidth = 1;
  for (let i = 0; i <= CANVAS_SIZE; i += CANVAS_SIZE / 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, CANVAS_SIZE);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(CANVAS_SIZE, i);
    ctx.stroke();
  }

  // Ward positions
  data.observers.forEach((ward) => drawWard(ctx, ward, '#34d399'));
  data.sentries.forEach((ward) => drawWard(ctx, ward, '#60a5fa'));

  // Frame and title
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, CANVAS_SIZE - 4, CANVAS_SIZE - 4);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(labels.title, 24, 44);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(labels.matchLabel, 24, 70);

  // Legend
  const legendY = CANVAS_SIZE - 80;
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '18px Arial';
  ctx.fillText(`${labels.observerLabel}: ${data.observers.length}`, 24, legendY);
  ctx.fillText(`${labels.sentryLabel}: ${data.sentries.length}`, 24, legendY + 26);
  ctx.fillText(formatDuration(data.durationSeconds), 24, legendY + 52);

  return canvas.toBuffer('image/png');
}

export type { MatchVision };
