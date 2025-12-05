/**
 * Error Handler Utility
 * 
 * Provides consistent error handling with logging, fallbacks, and user-friendly messages
 */

import logger from './logger.js';
import type { Interaction } from 'discord.js';

type LoggerLike = {
  error: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
};
const log = logger as LoggerLike;

export interface ErrorContext {
  context?: string;
  userId?: string;
  guildId?: string;
  operation?: string;
  [key: string]: unknown;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  isRetryable: boolean;
  fallback?: string;
}

/**
 * Map error types to user-friendly messages and retry eligibility
 */
export function handleError(error: unknown, ctx: ErrorContext): ErrorResponse {
  const errorStr = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  log.error(
    { error: errorStr, stack, ...ctx },
    `Error in ${ctx.operation || ctx.context || 'unknown operation'}`
  );

  // Database errors
  if (errorStr.includes('ECONNREFUSED') || errorStr.includes('connection')) {
    return {
      message: '❌ **Erro de Conexão**\n\nNão consegui conectar ao banco de dados. Tente novamente em alguns instantes.',
      code: 'DB_CONNECTION',
      isRetryable: true,
      fallback: 'Por favor, tente novamente mais tarde.',
    };
  }

  // Redis errors (shouldn't crash, but log them)
  if (errorStr.includes('Redis') || errorStr.includes('redis')) {
    log.warn({ error: errorStr }, 'Redis error - continuing without cache');
    return {
      message: '⚠️ Cache temporariamente indisponível, mas continuamos funcionando!',
      code: 'REDIS_ERROR',
      isRetryable: false,
      fallback: undefined,
    };
  }

  // API rate limiting
  if (errorStr.includes('429') || errorStr.includes('rate')) {
    return {
      message: '⏱️ **Limite de Requisições Atingido**\n\nA API está temporariamente ocupada. Aguarde 30 segundos e tente novamente.',
      code: 'RATE_LIMITED',
      isRetryable: true,
      fallback: 'Tente novamente em alguns instantes.',
    };
  }

  // API not found / invalid data
  if (errorStr.includes('404') || errorStr.includes('not found')) {
    return {
      message: '🔍 **Dados não encontrados**\n\nVerifique se o Steam ID está correto.',
      code: 'NOT_FOUND',
      isRetryable: false,
      fallback: 'Verifique os dados fornecidos.',
    };
  }

  // Profile private
  if (errorStr.includes('private') || errorStr.includes('Private')) {
    return {
      message: '🔒 **Perfil Privado**\n\nTorne seu perfil público nas configurações do Steam:\nConfigurations → Privacidade → "Expor dados públicos de partida"',
      code: 'PROFILE_PRIVATE',
      isRetryable: false,
      fallback: 'Publique seu perfil Steam.',
    };
  }

  // Timeout errors
  if (errorStr.includes('timeout') || errorStr.includes('TIMEOUT')) {
    return {
      message: '⏳ **Timeout**\n\nA requisição demorou muito. Tente novamente.',
      code: 'TIMEOUT',
      isRetryable: true,
      fallback: 'Tente novamente.',
    };
  }

  // Discord permission errors
  if (errorStr.includes('Missing Permissions') || errorStr.includes('permissions')) {
    return {
      message: '🔐 **Permissão Negada**\n\nO bot não tem permissão para executar essa ação.',
      code: 'PERMISSION_ERROR',
      isRetryable: false,
      fallback: 'Verifique as permissões do bot.',
    };
  }

  // Validation errors
  if (errorStr.includes('Invalid') || errorStr.includes('invalid')) {
    return {
      message: '❌ **Dados Inválidos**\n\nVerifique os dados fornecidos e tente novamente.',
      code: 'VALIDATION_ERROR',
      isRetryable: false,
      fallback: 'Verifique os dados.',
    };
  }

  // Generic fallback
  return {
    message: '❌ **Erro Inesperado**\n\nDesculpe, algo deu errado. Tente novamente em alguns instantes.',
    code: 'UNKNOWN_ERROR',
    isRetryable: true,
    fallback: 'Tente novamente mais tarde.',
  };
}

/**
 * Safe interaction reply with error handling
 */
export async function safeReply(
  interaction: Interaction,
  content: string,
  isEphemeral = true
): Promise<void> {
  try {
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content });
      } else {
        await interaction.reply({ content, ephemeral: isEphemeral });
      }
    }
  } catch (error) {
    log.error({ error }, 'Failed to send safe reply');
  }
}

/**
 * Retry with exponential backoff for transient failures
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isRetryable =
        error instanceof Error &&
        (error.message.includes('ECONNREFUSED') ||
          error.message.includes('TIMEOUT') ||
          error.message.includes('429'));

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      log.warn(
        { attempt, maxAttempts, delayMs, error: String(error) },
        'Retrying with backoff'
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Fallback function wrapper
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    log.warn({ error, context }, 'Primary operation failed, using fallback');
    try {
      return await fallback();
    } catch (fallbackError) {
      log.error({ error: fallbackError, context }, 'Fallback also failed');
      throw fallbackError;
    }
  }
}
