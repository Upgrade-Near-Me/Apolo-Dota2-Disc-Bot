# 🔧 Redis Caching - Developer Quick Reference

**Quick guide for using the Redis caching system in Apolo Bot**

---

## 📦 Import Redis Service

```typescript
import { redisService, CacheTTL } from './services/RedisService.js';
```

---

## 🎯 Common Operations

### 1. Get Cached Data

```typescript
// Type-safe retrieval
const profile = await redisService.get<ParsedStratzPlayer>('stratz:profile:123456789');

if (profile) {
  // Cache hit - use cached data
  console.log('✅ Cache hit');
  return profile;
}

// Cache miss - fetch from API
console.log('❌ Cache miss - fetching from API');
```

### 2. Cache API Response

```typescript
// After successful API call
const data = await fetchFromAPI();

// Cache with 1 hour TTL
await redisService.set('cache:key', data, CacheTTL.PLAYER_PROFILE);
```

### 3. Delete Cache Entry

```typescript
// Delete specific key
await redisService.del('stratz:profile:123456789');

// Delete all matches for a player
await redisService.delPattern('stratz:match:123456789:*');
```

### 4. Check if Key Exists

```typescript
const exists = await redisService.exists('stratz:profile:123456789');

if (exists) {
  console.log('Key exists in cache');
}
```

### 5. Check Remaining TTL

```typescript
const ttl = await redisService.ttl('stratz:profile:123456789');

console.log(`Key expires in ${ttl} seconds`);
// -1 = no expiry
// -2 = key doesn't exist
```

---

## ⏱️ Cache TTL Constants

```typescript
import { CacheTTL } from './services/RedisService.js';

CacheTTL.PLAYER_PROFILE   // 3600s (1 hour)
CacheTTL.MATCH_DATA       // 86400s (24 hours)
CacheTTL.MATCH_HISTORY    // 1800s (30 minutes)
CacheTTL.META_HEROES      // 3600s (1 hour)
CacheTTL.GUILD_SETTINGS   // 0 (no expiry)
```

---

## 🔑 Cache Key Patterns

**Use consistent key naming:**

```typescript
// Stratz Service
const keys = {
  lastMatch: (steamId: string) => `stratz:match:${steamId}:last`,
  playerProfile: (steamId: string) => `stratz:profile:${steamId}`,
  matchHistory: (steamId: string, limit: number) => `stratz:history:${steamId}:${limit}`,
};

// Guild Settings
const key = `guild:${guildId}:locale`;

// User Data
const key = `user:${discordId}:steam`;
```

**Pattern:** `service:type:identifier:variant`

---

## 💡 Best Practices

### ✅ DO

```typescript
// 1. Always check cache first
const cached = await redisService.get<Type>(key);
if (cached) return cached;

// 2. Always cache successful responses
const data = await apiCall();
await redisService.set(key, data, TTL);
return data;

// 3. Use appropriate TTLs
await redisService.set(key, data, CacheTTL.PLAYER_PROFILE); // 1hr

// 4. Log cache hits/misses
console.log(`✅ Cache hit: ${key}`);
console.log(`❌ Cache miss: ${key}`);
```

### ❌ DON'T

```typescript
// 1. Don't throw errors from cache operations
try {
  await redisService.set(key, data, TTL);
} catch (error) {
  // ❌ DON'T throw - just log
  throw error;
}

// 2. Don't cache error responses
try {
  const data = await apiCall();
  await redisService.set(key, data, TTL);
} catch (error) {
  // ❌ DON'T cache errors
  await redisService.set(key, null, TTL);
}

// 3. Don't use arbitrary keys
await redisService.set('player123', data, 3600); // ❌ Bad
await redisService.set(`stratz:profile:123`, data, 3600); // ✅ Good
```

---

## 🔄 Typical Caching Flow

```typescript
async function getPlayerData(steamId: string) {
  // 1. Define cache key
  const cacheKey = `stratz:profile:${steamId}`;
  
  // 2. Check cache
  const cached = await redisService.get<PlayerProfile>(cacheKey);
  if (cached) {
    console.log(`✅ Cache hit: ${steamId}`);
    return cached;
  }
  
  // 3. Fetch from API (cache miss)
  console.log(`🌐 Fetching from API: ${steamId}`);
  const data = await stratzAPI.getProfile(steamId);
  
  // 4. Cache the result
  await redisService.set(cacheKey, data, CacheTTL.PLAYER_PROFILE);
  
  // 5. Return data
  return data;
}
```

---

## 🛡️ Error Handling

### Graceful Degradation Pattern

```typescript
async function getData(id: string) {
  const cacheKey = `service:data:${id}`;
  
  try {
    // Try cache first
    const cached = await redisService.get<Data>(cacheKey);
    if (cached) return cached;
  } catch (error) {
    // Redis error - log and continue
    console.warn('Redis unavailable, fetching from API');
  }
  
  // Fetch from API
  const data = await apiCall(id);
  
  try {
    // Try to cache
    await redisService.set(cacheKey, data, TTL);
  } catch (error) {
    // Redis error - log but don't fail
    console.warn('Failed to cache result');
  }
  
  // Always return data
  return data;
}
```

**Key principle:** Never let Redis errors prevent data delivery

---

## 🧪 Testing Cache

### Manual Testing in Redis CLI

```powershell
# Connect to Redis
docker-compose exec redis redis-cli

# List all keys
KEYS *

# Get specific key
GET stratz:profile:123456789

# Check TTL
TTL stratz:profile:123456789

# Delete key
DEL stratz:profile:123456789

# Delete pattern
KEYS stratz:profile:* | xargs redis-cli DEL

# Clear all cache (USE CAREFULLY!)
FLUSHALL

# Exit
exit
```

### Programmatic Testing

```typescript
// Test cache operations
console.log('Testing Redis...');

// Test set
await redisService.set('test:key', { value: 'hello' }, 60);

// Test get
const result = await redisService.get<{ value: string }>('test:key');
console.log('Get result:', result); // { value: 'hello' }

// Test TTL
const ttl = await redisService.ttl('test:key');
console.log('TTL:', ttl); // ~60

// Test exists
const exists = await redisService.exists('test:key');
console.log('Exists:', exists); // true

// Test delete
await redisService.del('test:key');

console.log('✅ Redis tests passed');
```

---

## 📊 Monitoring Cache Performance

### Check Cache Statistics

```powershell
# Connect to Redis
docker-compose exec redis redis-cli

# Get cache stats
INFO stats

# Key metrics:
# - keyspace_hits: Number of cache hits
# - keyspace_misses: Number of cache misses
# - used_memory_human: Memory usage
# - connected_clients: Active connections
```

### Calculate Cache Hit Rate

```bash
# Get stats
keyspace_hits=$(redis-cli INFO stats | grep keyspace_hits | cut -d: -f2)
keyspace_misses=$(redis-cli INFO stats | grep keyspace_misses | cut -d: -f2)

# Calculate hit rate
hit_rate=$((keyspace_hits * 100 / (keyspace_hits + keyspace_misses)))

echo "Cache hit rate: ${hit_rate}%"
```

**Target:** 80-90% hit rate

---

## 🚨 Troubleshooting

### Issue: Redis Not Connecting

**Check logs:**
```powershell
docker-compose logs redis
```

**Verify health:**
```powershell
docker-compose exec redis redis-cli ping
# Expected: PONG
```

**Restart Redis:**
```powershell
docker-compose restart redis
```

### Issue: Cache Not Working

**Check RedisService status:**
```typescript
const status = redisService.getStatus();
console.log('Redis status:', status);
// { connected: true, client: true }
```

**Test connection:**
```typescript
await redisService.set('test', 'value', 10);
const result = await redisService.get('test');
console.log('Test result:', result); // 'value'
```

### Issue: Cache Serving Stale Data

**Invalidate cache:**
```typescript
// Invalidate specific player
await invalidatePlayerCache(steamId);

// Invalidate all player caches
await redisService.delPattern('stratz:profile:*');
```

**Reduce TTL:**
```typescript
// Change TTL from 1hr to 5min for testing
await redisService.set(key, data, 300);
```

---

## 🔗 Related Files

- `src/services/RedisService.ts` - Redis client implementation
- `src/services/stratzService.ts` - Example caching integration
- `PHASE5_COMPLETE.md` - Full documentation
- `.github/copilot-instructions.md` - Enterprise standards

---

## 📞 Need Help?

**Check these resources:**

1. [ioredis Documentation](https://github.com/redis/ioredis)
2. [Redis Commands](https://redis.io/commands/)
3. `PHASE5_COMPLETE.md` - Implementation guide
4. Project logs: `docker-compose logs -f bot`

---

**Last Updated:** 2025-01-XX  
**Maintainer:** Development Team
