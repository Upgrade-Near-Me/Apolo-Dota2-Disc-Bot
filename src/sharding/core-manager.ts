/**
 * 🚀 Phase 17: Core Sharding Manager
 * Enterprise-grade sharding for 1M+ users
 */

import { EventEmitter } from 'events';
import Redis from 'ioredis';

export interface ShardingConfig {
  token: string;
  redisHost?: string;
  redisPort?: number;
  usersPerShard?: number; // Default: 100,000
  healthCheckInterval?: number; // ms, default: 30000
  shardTimeout?: number; // ms, default: 180000
}

export interface ShardHealth {
  shardId: number;
  status: 'spawning' | 'ready' | 'disconnected' | 'dead';
  readyAt: Date | null;
  guilds: number;
  members: number;
  lastHealthCheck: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  totalShards: number;
  readyShards: number;
  totalGuilds: number;
  totalMembers: number;
}

/**
 * Core Sharding Manager
 * Orchestrates Discord bot across multiple shard processes
 */
export class ShardingManager extends EventEmitter {
  private config: Required<ShardingConfig>;
  private redis: Redis | null = null;
  private shards: Map<number, ShardHealth> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private totalShards = 0;

  constructor(config: ShardingConfig) {
    super();
    this.config = {
      token: config.token,
      redisHost: config.redisHost || 'localhost',
      redisPort: config.redisPort || 6379,
      usersPerShard: config.usersPerShard || 100000,
      healthCheckInterval: config.healthCheckInterval || 30000,
      shardTimeout: config.shardTimeout || 180000,
    };
  }

  /**
   * Initialize sharding manager
   */
  async initialize(): Promise<void> {
    try {
      // Connect to Redis for state management
      this.redis = new Redis({
        host: this.config.redisHost,
        port: this.config.redisPort,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });

      // Touch redis to ensure connectivity
      await this.redis.ping();

      console.log('[Sharding] Manager initialized');
      this.emit('initialized');
    } catch (error) {
      this.redis = null;
      console.warn('[Sharding] Redis unavailable, continuing without Redis:', error instanceof Error ? error.message : error);
      this.emit('initialized');
    }
  }

  /**
   * Calculate shards needed for guild count
   */
  calculateShardCount(guildCount: number): number {
    return Math.max(1, Math.ceil(guildCount / this.config.usersPerShard));
  }

  /**
   * Get shard ID for guild
   */
  getShardForGuild(guildId: string): number {
    if (this.totalShards === 0) {
      return 0;
    }
    const id = BigInt(guildId);
    return Number((id >> 22n) % BigInt(this.totalShards));
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(totalShards: number): void {
    this.totalShards = totalShards;

    for (let i = 0; i < totalShards; i++) {
      this.shards.set(i, {
        shardId: i,
        status: 'spawning',
        readyAt: null,
        guilds: 0,
        members: 0,
        lastHealthCheck: new Date(),
      });
    }

    this.healthCheckTimer = setInterval(() => {
      this.checkHealth();
    }, this.config.healthCheckInterval);

    console.log(`[Sharding] Health monitoring started for ${totalShards} shards`);
  }

  /**
   * Update shard health
   */
  updateShardHealth(shardId: number, data: Partial<ShardHealth>): void {
    const health = this.shards.get(shardId);
    if (health) {
      Object.assign(health, data, { lastHealthCheck: new Date() });
    }
  }

  /**
   * Check health of all shards
   */
  private checkHealth(): void {
    let deadCount = 0;

    for (const [, health] of this.shards) {
      const timeSinceCheck = Date.now() - health.lastHealthCheck.getTime();

      if (timeSinceCheck > this.config.shardTimeout && health.status !== 'dead') {
        health.status = 'dead';
        deadCount++;
        this.emit('shardDead', health.shardId);
      }

    }

    if (deadCount > 0) {
      console.warn(`[Sharding] ${deadCount} dead shard(s) detected`);
    }
  }

  /**
   * Get system health
   */
  getSystemHealth(): SystemHealth {
    let readyCount = 0;
    let totalGuilds = 0;
    let totalMembers = 0;

    for (const health of this.shards.values()) {
      if (health.status === 'ready') {
        readyCount++;
        totalGuilds += health.guilds;
        totalMembers += health.members;
      }
    }

    const status = readyCount === this.totalShards ? 'healthy' : readyCount > 0 ? 'degraded' : 'critical';

    return {
      status,
      totalShards: this.totalShards,
      readyShards: readyCount,
      totalGuilds,
      totalMembers,
    };
  }

  /**
   * Broadcast message to all shards
   */
  async broadcast(command: string, data: unknown = {}): Promise<void> {
    if (!this.redis) return;

    const message = {
      command,
      data,
      timestamp: Date.now(),
    };

    await this.redis.publish('sharding:broadcast', JSON.stringify(message));
  }

  /**
   * Get shard stats
   */
  getShardStats(shardId: number): ShardHealth | undefined {
    return this.shards.get(shardId);
  }

  /**
   * Get all shard stats
   */
  getAllShards(): ShardHealth[] {
    return Array.from(this.shards.values());
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[Sharding] Starting graceful shutdown...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        console.warn('[Sharding] Redis shutdown warning:', error instanceof Error ? error.message : error);
      }
    }

    this.emit('shutdown');
  }
}

export default ShardingManager;
