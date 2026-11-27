import type { RedisClient } from '../models/redis.model';

export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export function createNoopCacheStore(): CacheStore {
  return {
    async get() {
      return null;
    },
    async set() {
      return undefined;
    },
    async delete() {
      return undefined;
    },
  };
}

export function createRedisCacheStore(client: RedisClient): CacheStore {
  return {
    async get<T>(key: string): Promise<T | null> {
      if (!client.isReady) {
        return null;
      }

      try {
        const raw = await client.get(key);

        return raw === null ? null : (JSON.parse(raw) as T);
      } catch (error: unknown) {
        console.error(`Redis cache read failed for ${key}`, error);
        return null;
      }
    },

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      if (!client.isReady) {
        return;
      }

      try {
        await client.set(key, JSON.stringify(value), {
          expiration: { type: 'EX', value: ttlSeconds },
        });
      } catch (error: unknown) {
        console.error(`Redis cache write failed for ${key}`, error);
      }
    },

    async delete(key: string): Promise<void> {
      if (!client.isReady) {
        return;
      }

      try {
        await client.del(key);
      } catch (error: unknown) {
        console.error(`Redis cache delete failed for ${key}`, error);
      }
    },
  };
}
