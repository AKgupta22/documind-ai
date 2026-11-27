import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RedisClient } from '../../src/models/redis.model.ts';
import {
  createNoopCacheStore,
  createRedisCacheStore,
} from '../../src/services/cache.service.ts';

interface FakeRedis {
  isReady: boolean;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
}

function fakeRedis(overrides: Partial<FakeRedis> = {}): FakeRedis {
  return {
    isReady: true,
    get: vi.fn(async () => null),
    set: vi.fn(async () => 'OK'),
    del: vi.fn(async () => 1),
    ...overrides,
  };
}

describe('noop cache store', () => {
  it('always misses and accepts writes and deletes', async () => {
    const cache = createNoopCacheStore();

    await expect(cache.get('profile:user-1')).resolves.toBeNull();
    await expect(cache.set('profile:user-1', { id: 'user-1' }, 60)).resolves
      .toBeUndefined();
    await expect(cache.delete('profile:user-1')).resolves.toBeUndefined();
  });
});

describe('redis cache store', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads and parses JSON values', async () => {
    const client = fakeRedis({
      get: vi.fn(async () => JSON.stringify({ id: 'user-1', fullname: 'Avery' })),
    });
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await expect(cache.get('profile:user-1')).resolves.toEqual({
      id: 'user-1',
      fullname: 'Avery',
    });
    expect(client.get).toHaveBeenCalledWith('profile:user-1');
  });

  it('returns null when the key is missing', async () => {
    const client = fakeRedis();
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await expect(cache.get('profile:user-1')).resolves.toBeNull();
  });

  it('writes JSON with a TTL', async () => {
    const client = fakeRedis();
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await cache.set('profile:user-1', { id: 'user-1' }, 300);

    expect(client.set).toHaveBeenCalledWith(
      'profile:user-1',
      JSON.stringify({ id: 'user-1' }),
      { expiration: { type: 'EX', value: 300 } },
    );
  });

  it('deletes keys', async () => {
    const client = fakeRedis();
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await cache.delete('profile:user-1');

    expect(client.del).toHaveBeenCalledWith('profile:user-1');
  });

  it('skips commands while the client is not ready', async () => {
    const client = fakeRedis({ isReady: false });
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await expect(cache.get('profile:user-1')).resolves.toBeNull();
    await cache.set('profile:user-1', { id: 'user-1' }, 300);
    await cache.delete('profile:user-1');

    expect(client.get).not.toHaveBeenCalled();
    expect(client.set).not.toHaveBeenCalled();
    expect(client.del).not.toHaveBeenCalled();
  });

  it('falls back to a cache miss when Redis fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = fakeRedis({
      get: vi.fn(async () => {
        throw new Error('connection lost');
      }),
      set: vi.fn(async () => {
        throw new Error('connection lost');
      }),
      del: vi.fn(async () => {
        throw new Error('connection lost');
      }),
    });
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await expect(cache.get('profile:user-1')).resolves.toBeNull();
    await expect(
      cache.set('profile:user-1', { id: 'user-1' }, 300),
    ).resolves.toBeUndefined();
    await expect(cache.delete('profile:user-1')).resolves.toBeUndefined();
  });

  it('treats malformed JSON as a cache miss', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const client = fakeRedis({ get: vi.fn(async () => 'not-json') });
    const cache = createRedisCacheStore(client as unknown as RedisClient);

    await expect(cache.get('profile:user-1')).resolves.toBeNull();
  });
});
