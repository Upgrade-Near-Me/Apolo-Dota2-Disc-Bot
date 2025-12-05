/**
 * Simple Redis-backed rate limiter (token counter per window).
 * Falls back to allowing traffic if Redis is unavailable while logging the event.
 */
import logger from './logger.js';
import { redisService } from '../services/RedisService.js';

type LoggerLike = { warn: (obj: unknown, msg?: string) => void };
const log = logger as LoggerLike;

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
  context?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  redisConnected: boolean;
}

export class RateLimitError extends Error {
  retryAfter: number;

  constructor(retryAfter: number, message?: string) {
    super(message || 'Rate limit exceeded');
    this.retryAfter = retryAfter;
  }
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds, context } = options;
  const counter = await redisService.incrementWithTTL(key, windowSeconds);

  const allowed = counter.count <= limit;
  const remaining = Math.max(limit - counter.count, 0);
  const retryAfter = allowed ? 0 : Math.max(counter.ttl, 1);

  if (!allowed) {
    log.warn({ key, limit, windowSeconds, retryAfter, context }, 'Rate limit exceeded');
  } else if (!counter.connected) {
    log.warn({ key, context }, 'Rate limiter fallback: Redis unavailable, allowing request');
  }

  return {
    allowed,
    remaining,
    retryAfter,
    redisConnected: counter.connected,
  };
}

export async function enforceRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const result = await checkRateLimit(options);

  if (!result.allowed) {
    throw new RateLimitError(result.retryAfter, `${options.context || 'rate-limit'} exceeded`);
  }

  return result;
}
