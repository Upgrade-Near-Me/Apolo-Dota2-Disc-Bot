/**
 * 🪵 Structured Logger Module
 *
 * Central logging service for all modules
 * Provides type-safe logging with structured output
 * Integrates with Prometheus metrics for monitoring
 */

import pino from 'pino';

interface LogContext {
  event: string;
  message?: string;
  [key: string]: any;
}

class Logger {
  private pinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
  });

  info(context: LogContext): void {
    this.pinoLogger.info(context);
  }

  warn(context: LogContext): void {
    this.pinoLogger.warn(context);
  }

  error(context: LogContext & { error?: string; stack?: string }): void {
    this.pinoLogger.error(context);
  }

  debug(context: LogContext): void {
    this.pinoLogger.debug(context);
  }
}

export const logger = new Logger();
