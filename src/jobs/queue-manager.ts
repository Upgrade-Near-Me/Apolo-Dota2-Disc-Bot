/**
 * ⚡ Queue Manager - Centralized job queue management
 *
 * Handles:
 * - Queue initialization
 * - Worker startup/shutdown
 * - Job monitoring
 * - Health checks
 * - Graceful degradation
 */

import {
  imageQueue,
  chartQueue,
  aiQueue,
  leaderboardQueue,
  bulkQueue,
  imageWorker,
  chartWorker,
  aiWorker,
  leaderboardWorker,
  bulkWorker,
  getQueueStats,
  shutdownQueues,
} from './bull-queues.js';

interface QueueHealthStatus {
  queue: string;
  status: 'healthy' | 'degraded' | 'critical';
  active: number;
  pending: number;
  failed: number;
  paused: boolean;
}

interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'critical';
  queues: QueueHealthStatus[];
  totalJobsActive: number;
  totalJobsPending: number;
  totalJobsFailed: number;
  timestamp: string;
}

/**
 * Initialize all queues and workers
 */
export async function initializeQueues(): Promise<void> {
  console.log('🚀 Initializing BullMQ Job Queues...');

  try {
    // Verify all queues are ready
    const queues = [imageQueue, chartQueue, aiQueue, leaderboardQueue, bulkQueue];

    for (const queue of queues) {
      // Clean up stale jobs
      await queue.clean(3600000, 100);              // Remove jobs older than 1 hour
      console.log(`✅ Queue initialized: ${queue.name}`);
    }

    // Verify workers are ready
    const workers = [imageWorker, chartWorker, aiWorker, leaderboardWorker, bulkWorker];

    for (const worker of workers) {
      console.log(`✅ Worker ready: ${worker.name}`);
    }

    console.log('🎉 All BullMQ queues and workers initialized');
  } catch (error) {
    console.error('❌ Failed to initialize queues:', error);
    throw error;
  }
}

/**
 * Get comprehensive health status of all queues
 */
export async function getQueuesHealthStatus(): Promise<SystemHealthReport> {
  const queueNames = ['image-generation', 'chart-generation', 'ai-analysis', 'leaderboard-update', 'bulk-operations'];
  const queues: QueueHealthStatus[] = [];

  let totalActive = 0;
  let totalPending = 0;
  let totalFailed = 0;

  for (const queueName of queueNames) {
    try {
      const stats = await getQueueStats(queueName);

      const status: QueueHealthStatus = {
        queue: queueName,
        status: stats.failed > 10 ? 'critical' : stats.active > 100 ? 'degraded' : 'healthy',
        active: stats.active,
        pending: stats.waiting + stats.delayed,
        failed: stats.failed,
        paused: false,
      };

      queues.push(status);

      totalActive += stats.active;
      totalPending += stats.waiting + stats.delayed;
      totalFailed += stats.failed;
    } catch (error) {
      console.error(`❌ Failed to get stats for ${queueName}:`, error);

      queues.push({
        queue: queueName,
        status: 'critical',
        active: 0,
        pending: 0,
        failed: -1,
        paused: true,
      });
    }
  }

  const overallStatus = totalFailed > 50 ? 'critical' : totalActive > 500 ? 'degraded' : 'healthy';

  return {
    status: overallStatus,
    queues,
    totalJobsActive: totalActive,
    totalJobsPending: totalPending,
    totalJobsFailed: totalFailed,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate health report for logging
 */
export async function generateQueuesHealthReport(): Promise<string> {
  const health = await getQueuesHealthStatus();

  let report = `
╔════════════════════════════════════════════════╗
║          BULLMQ QUEUES HEALTH REPORT          ║
╚════════════════════════════════════════════════╝

System Status: ${health.status.toUpperCase()}

📊 Overall Statistics:
   Total Active Jobs:     ${health.totalJobsActive}
   Total Pending Jobs:    ${health.totalJobsPending}
   Total Failed Jobs:     ${health.totalJobsFailed}

🔍 Queue Details:
`;

  for (const queue of health.queues) {
    const statusEmoji = queue.status === 'healthy' ? '✅' : queue.status === 'degraded' ? '⚠️' : '❌';

    report += `
   ${statusEmoji} ${queue.queue}
      Status:    ${queue.status.toUpperCase()}
      Active:    ${queue.active}
      Pending:   ${queue.pending}
      Failed:    ${queue.failed}`;
  }

  report += `

⏱️  Timestamp: ${health.timestamp}
`;

  return report;
}

/**
 * Graceful shutdown of all queues
 */
export async function gracefulShutdown(): Promise<void> {
  console.log('🛑 Initiating graceful shutdown of job queues...');

  try {
    // Give workers time to finish current jobs
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Shut down all queues
    await shutdownQueues();

    console.log('✅ Graceful shutdown complete');
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    throw error;
  }
}

/**
 * Monitor queue metrics periodically
 */
export async function startQueueMonitoring(intervalSeconds = 60): Promise<NodeJS.Timeout> {
  const interval = setInterval(async () => {
    try {
      const report = await generateQueuesHealthReport();
      console.log(report);
    } catch (error) {
      console.error('❌ Queue monitoring error:', error);
    }
  }, intervalSeconds * 1000);

  console.log(`📊 Queue monitoring started (interval: ${intervalSeconds}s)`);

  return interval;
}

/**
 * Clear failed jobs from a queue
 */
export async function clearFailedJobs(queueName: string): Promise<number> {
  const queues: { [key: string]: any } = {
    'image-generation': imageQueue,
    'chart-generation': chartQueue,
    'ai-analysis': aiQueue,
    'leaderboard-update': leaderboardQueue,
    'bulk-operations': bulkQueue,
  };

  if (!queues[queueName]) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  const failedCount = await queues[queueName].clean(0, 0, 'failed');
  console.log(`🧹 Cleared ${failedCount} failed jobs from ${queueName}`);

  return failedCount;
}

/**
 * Get detailed job information
 */
export async function getJobDetails(jobId: string, queueName: string): Promise<any> {
  const queues: { [key: string]: any } = {
    'image-generation': imageQueue,
    'chart-generation': chartQueue,
    'ai-analysis': aiQueue,
    'leaderboard-update': leaderboardQueue,
    'bulk-operations': bulkQueue,
  };

  if (!queues[queueName]) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  const job = await queues[queueName].getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  const logs = await job.getLogs(1000);

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    result: job.returnvalue,
    error: job.failedReason,
    attempts: job.attempts,
    maxAttempts: job.opts.attempts,
    timestamp: job.timestamp,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    logs,
  };
}

/**
 * Retry failed job
 */
export async function retryFailedJob(jobId: string, queueName: string): Promise<boolean> {
  const queues: { [key: string]: any } = {
    'image-generation': imageQueue,
    'chart-generation': chartQueue,
    'ai-analysis': aiQueue,
    'leaderboard-update': leaderboardQueue,
    'bulk-operations': bulkQueue,
  };

  if (!queues[queueName]) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  const job = await queues[queueName].getJob(jobId);

  if (!job) {
    return false;
  }

  const state = await job.getState();

  if (state === 'failed') {
    await job.retry();
    console.log(`🔄 Retrying failed job: ${jobId}`);
    return true;
  }

  return false;
}

/**
 * Pause/resume queue
 */
export async function pauseQueue(queueName: string, pause = true): Promise<void> {
  const queues: { [key: string]: any } = {
    'image-generation': imageQueue,
    'chart-generation': chartQueue,
    'ai-analysis': aiQueue,
    'leaderboard-update': leaderboardQueue,
    'bulk-operations': bulkQueue,
  };

  if (!queues[queueName]) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  if (pause) {
    await queues[queueName].pause();
    console.log(`⏸️  Queue paused: ${queueName}`);
  } else {
    await queues[queueName].resume();
    console.log(`▶️  Queue resumed: ${queueName}`);
  }
}

export default {
  initializeQueues,
  getQueuesHealthStatus,
  generateQueuesHealthReport,
  gracefulShutdown,
  startQueueMonitoring,
  clearFailedJobs,
  getJobDetails,
  retryFailedJob,
  pauseQueue,
};
