import logger from './logger.js';

export type ApiService = 'stratz' | 'opendota' | 'gemini';

interface Pool {
  keys: string[];
  cooldown: Map<string, number>;
  index: number;
}

const MAX_KEYS = 10;

function loadKeys(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= MAX_KEYS; i += 1) {
    const value = process.env[`${prefix}_${i}`];
    if (value && value.trim() && !value.includes('your_') && !value.includes('placeholder')) {
      keys.push(value.trim());
    }
  }
  return keys;
}

const pools: Record<ApiService, Pool> = {
  stratz: { keys: loadKeys('STRATZ_API_TOKEN'), cooldown: new Map(), index: 0 },
  opendota: { keys: loadKeys('OPEN_DOTA_API_KEY'), cooldown: new Map(), index: 0 },
  gemini: { keys: loadKeys('GEMINI_API_KEY'), cooldown: new Map(), index: 0 },
};

function nextKey(service: ApiService): string | null {
  const pool = pools[service];
  const now = Date.now();
  if (pool.keys.length === 0) return null;

  for (let i = 0; i < pool.keys.length; i += 1) {
    const idx = (pool.index + i) % pool.keys.length;
    const key = pool.keys[idx];
    if (!key) continue;
    const until = pool.cooldown.get(key) ?? 0;
    if (until > now) continue; // still cooling down
    pool.index = (idx + 1) % pool.keys.length;
    return key;
  }
  return null;
}

export function getApiKey(service: ApiService): string | null {
  const key = nextKey(service);
  if (!key) {
    logger.debug({ service }, 'No API key available for service');
  }
  return key;
}

export function markKeyAsCooldown(service: ApiService, key: string | null, cooldownMs = 10 * 60 * 1000): void {
  if (!key) return;
  const pool = pools[service];
  pool.cooldown.set(key, Date.now() + cooldownMs);
  logger.warn({ service, keySuffix: key.slice(-6), cooldownMs }, 'API key put on cooldown');
}

export function isServiceEnabled(service: ApiService): boolean {
  return pools[service].keys.length > 0;
}
