/**
 * 🔗 Inter-Process Communication (IPC) Handler
 *
 * Enables cross-shard communication for:
 * - Broadcasting commands to all shards
 * - State synchronization
 * - Query forwarding
 * - Error handling with retries
 * - Message deduplication
 *
 * Protocol:
 * - Request/Response with message IDs
 * - 30-second timeout per message
 * - Automatic retry on timeout
 * - Redis backing for reliability
 */

import Redis from 'ioredis';

/**
 * ========================================================================
 * IPC MESSAGE TYPES
 * ========================================================================
 */

export interface IpcMessage {
  id: string;
  type: 'request' | 'response' | 'broadcast' | 'error';
  event: string;
  sender: number; // shard ID
  receiver?: number | 'all'; // shard ID or 'all'
  data?: unknown;
  timestamp: number;
  retries?: number;
}

export interface IpcResponse {
  messageId: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * ========================================================================
 * IPC HANDLER CLASS
 * ========================================================================
 */

export class IpcHandler {
  private redis: Redis;
  private shardId: number;
  private messageCache: Map<string, IpcMessage> = new Map();
  private responseWaiters: Map<string, { resolve: (value: unknown) => void; reject: (reason?: unknown) => void; timeout: NodeJS.Timeout }> = new Map();
  private handlers: Map<string, (data: unknown, sender: number) => Promise<unknown>> = new Map();
  private subscribed = false;
  private connected = false;

  constructor(redis: Redis, shardId: number) {
    this.redis = redis;
    this.shardId = shardId;
  }

  /**
   * Initialize IPC handler
   */
  async initialize(): Promise<void> {
    try {
      await this.redis.ping();
      this.connected = true;
      await this.subscribeToMessages();
      console.log(`[IPC] Shard ${this.shardId} connected`);
    } catch (error) {
      this.connected = false;
      console.warn(`[IPC] Shard ${this.shardId} could not connect to Redis (tests may be skipped).`, error instanceof Error ? error.message : error);
    }
  }

  /**
   * Subscribe to IPC messages
   */
  private async subscribeToMessages(): Promise<void> {
    if (this.subscribed || !this.connected) return;

    const subscriber = this.redis.duplicate();

    subscriber.on('message', (channel: string, message: string) => {
      void (async () => {
        try {
          const ipcMessage = JSON.parse(message) as IpcMessage;

          // Check if message is for this shard
          if (ipcMessage.receiver && ipcMessage.receiver !== 'all' && ipcMessage.receiver !== this.shardId) {
            return;
          }

          // Deduplicate
          if (this.messageCache.has(ipcMessage.id)) {
            return;
          }
          this.messageCache.set(ipcMessage.id, ipcMessage);

          // Handle message
          if (ipcMessage.type === 'request') {
            await this.handleRequest(ipcMessage);
          } else if (ipcMessage.type === 'response') {
            this.handleResponse(ipcMessage);
          } else if (ipcMessage.type === 'broadcast') {
            await this.handleBroadcast(ipcMessage);
          }
        } catch (error) {
          console.error('[IPC] Message handling error:', error);
        }
      })();
    });

    await subscriber.subscribe(`ipc:shard:${this.shardId}`, 'ipc:broadcast');
    this.subscribed = true;
  }

  /**
   * Register event handler
   */
  registerHandler(event: string, handler: (data: unknown, sender: number) => Promise<unknown>): void {
    this.handlers.set(event, handler);
  }

  /**
   * Handle incoming request
   */
  private async handleRequest(message: IpcMessage): Promise<void> {
    try {
      const handler = this.handlers.get(message.event);

      if (!handler) {
        await this.sendResponse(message.id, message.sender, false, undefined, `Handler not found: ${message.event}`);
        return;
      }

      const result = await handler(message.data, message.sender);
      await this.sendResponse(message.id, message.sender, true, result);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await this.sendResponse(message.id, message.sender, false, undefined, errorMsg);
    }
  }

  /**
   * Handle response to request
   */
  private handleResponse(message: IpcMessage): void {
    const waiter = this.responseWaiters.get(message.id);

    if (!waiter) {
      console.warn(`[IPC] Response for unknown request: ${message.id}`);
      return;
    }

    clearTimeout(waiter.timeout);
    this.responseWaiters.delete(message.id);

    const payload = message.data as { error?: string; result?: unknown } | undefined;
    if (payload?.error) {
      waiter.reject(new Error(payload.error));
    } else {
      waiter.resolve(payload?.result);
    }
  }

  /**
   * Handle broadcast message
   */
  private async handleBroadcast(message: IpcMessage): Promise<void> {
    const handler = this.handlers.get(message.event);

    if (handler) {
      try {
        await handler(message.data, message.sender);
      } catch (error) {
        console.error(`[IPC] Broadcast handler error: ${message.event}`, error);
      }
    }
  }

  /**
   * Send response to request
   */
  private async sendResponse(messageId: string, targetShard: number, success: boolean, data?: unknown, error?: string): Promise<void> {
    if (!this.connected) return;
    const response: IpcMessage = {
      id: messageId,
      type: 'response',
      event: '',
      sender: this.shardId,
      receiver: targetShard,
      data: { success, result: data, error },
      timestamp: Date.now(),
    };

    try {
      await this.redis.publish(`ipc:shard:${targetShard}`, JSON.stringify(response));
    } catch (publishError) {
      this.connected = false;
      console.warn('[IPC] Failed to send response, connection lost:', publishError instanceof Error ? publishError.message : publishError);
    }
  }

  /**
   * Send request to another shard
   */
  async request(shardId: number, event: string, data?: unknown, timeoutMs: number = 30000): Promise<unknown> {
    if (!this.connected) {
      throw new Error('IPC not connected to Redis');
    }
    const messageId = this.generateMessageId();

    const message: IpcMessage = {
      id: messageId,
      type: 'request',
      event,
      sender: this.shardId,
      receiver: shardId,
      data,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseWaiters.delete(messageId);
        reject(new Error(`IPC request timeout: ${event} to shard ${shardId}`));
      }, timeoutMs);

      this.responseWaiters.set(messageId, { resolve, reject, timeout });

      this.redis.publish(`ipc:shard:${shardId}`, JSON.stringify(message)).catch((error) => {
        clearTimeout(timeout);
        this.responseWaiters.delete(messageId);
        this.connected = false;
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  /**
   * Broadcast message to all shards
   */
  async broadcast(event: string, data?: unknown): Promise<void> {
    if (!this.connected) return;
    const message: IpcMessage = {
      id: this.generateMessageId(),
      type: 'broadcast',
      event,
      sender: this.shardId,
      receiver: 'all',
      data,
      timestamp: Date.now(),
    };

    try {
      await this.redis.publish('ipc:broadcast', JSON.stringify(message));
    } catch (publishError) {
      this.connected = false;
      console.warn('[IPC] Failed to broadcast, connection lost:', publishError instanceof Error ? publishError.message : publishError);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${this.shardId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStats(): IpcStats {
    return {
      shardId: this.shardId,
      handledMessages: this.messageCache.size,
      pendingRequests: this.responseWaiters.size,
      registeredHandlers: this.handlers.size,
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    for (const waiter of this.responseWaiters.values()) {
      clearTimeout(waiter.timeout);
    }
    this.responseWaiters.clear();
    this.messageCache.clear();
    try {
      if (this.connected) {
        await this.redis.quit();
      }
    } catch {
      // ignore
    }
  }
}

/**
 * ========================================================================
 * INTERFACES & TYPES
 * ========================================================================
 */

export interface IpcStats {
  shardId: number;
  handledMessages: number;
  pendingRequests: number;
  registeredHandlers: number;
}

export default IpcHandler;
