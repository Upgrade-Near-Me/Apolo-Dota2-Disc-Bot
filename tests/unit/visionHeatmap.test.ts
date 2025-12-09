/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMatchVision } from '../../src/services/openDotaService.js';
import type { MatchVision } from '../../src/services/openDotaService.js';
import { generateWardHeatmap } from '../../src/utils/heatmap.js';

const mockCtx = {
  fillStyle: '#000',
  strokeStyle: '#000',
  lineWidth: 1,
  font: '',
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  getContext: vi.fn(),
};

vi.mock('@napi-rs/canvas', () => ({
  createCanvas: vi.fn(() => ({
    getContext: vi.fn(() => mockCtx),
    toBuffer: vi.fn(() => Buffer.from('mock-buffer')),
  })),
  SKRSContext2D: vi.fn(),
}));

describe('getMatchVision', () => {
  type MockResponse = { ok: boolean; json: () => Promise<unknown> };
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('maps observer and sentry wards with side and duration', async () => {
    const fetchMock = vi.fn((): Promise<MockResponse> =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          duration: 1800,
          obs_log: [{ x: 10, y: 20, time: 30, player_slot: 0 }],
          sen_log: [{ x: 30, y: 40, time: 50, player_slot: 129 }],
        }),
      })
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    const typedResult = (await getMatchVision(123456)) as MatchVision;

    expect(typedResult.matchId).toBe(123456);
    expect(typedResult.duration).toBe(1800);
    expect(typedResult.observers).toHaveLength(1);
    expect(typedResult.sentries).toHaveLength(1);
    expect(typedResult.observers[0]).toMatchObject({ side: 'RADIANT', type: 'observer' });
    expect(typedResult.sentries[0]).toMatchObject({ side: 'DIRE', type: 'sentry' });
  });
});

describe('generateWardHeatmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heatmap buffer using ward data and labels', async () => {
    const buffer = await generateWardHeatmap(
      {
        matchId: '42',
        durationSeconds: 1200,
        observers: [{ x: 64, y: 64, time: 100, type: 'observer', side: 'RADIANT' }],
        sentries: [{ x: 32, y: 96, time: 200, type: 'sentry', side: 'DIRE' }],
      },
      {
        title: 'Ward Heatmap',
        matchLabel: 'Match 42',
        observerLabel: 'Observers',
        sentryLabel: 'Sentries',
      }
    );

    expect(buffer.toString()).toBe('mock-buffer');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.strokeRect).toHaveBeenCalled();
    expect(mockCtx.createRadialGradient).toHaveBeenCalled();
  });
});
