/**
 * HTTP Server for Prometheus Metrics
 * 
 * Exposes /metrics endpoint for Prometheus scraping.
 * Runs on separate port (default: 9090) to not interfere with Discord bot.
 * 
 * @module Server
 */

import express, { Request, Response } from 'express';
import { getMetrics, getContentType } from './services/MetricsService.js';

const app = express();
const PORT = process.env.METRICS_PORT || 9090;

/**
 * Metrics endpoint for Prometheus scraping
 * 
 * GET /metrics
 * 
 * Returns Prometheus-formatted metrics text
 */
app.get('/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    res.set('Content-Type', getContentType());
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

/**
 * Health check endpoint
 * 
 * GET /health
 * 
 * Returns basic health status
 */
app.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'apolo-dota2-bot',
    version: '2.1.0'
  });
});

/**
 * Root endpoint (informational)
 */
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    service: 'APOLO Dota 2 Bot - Metrics Server',
    version: '2.1.0',
    endpoints: {
      metrics: '/metrics',
      health: '/health'
    },
    documentation: 'https://github.com/Upgrade-Near-Me/Apolo-Dota2-Disc-Bot'
  });
});

/**
 * Start metrics server
 */
export function startMetricsServer(): void {
  app.listen(PORT, () => {
    console.log(`📊 Metrics server running on http://localhost:${PORT}`);
    console.log(`   - Metrics: http://localhost:${PORT}/metrics`);
    console.log(`   - Health: http://localhost:${PORT}/health`);
  });
}

/**
 * Export app for testing
 */
export default app;
