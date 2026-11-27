import type { Express } from 'express';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import type { AppDependencies } from '../../src/app.ts';
import type { AuthConfig } from '../../src/config/auth.ts';
import type { CacheStore } from '../../src/services/cache.service.ts';
import { profileCacheKey } from '../../src/services/profile.service.ts';
import { issueTokenPair } from '../../src/services/token.service.ts';

type PrismaStub = AppDependencies['prisma'];

const auth: AuthConfig = {
  jwtSalt: 'test-jwt-salt',
  cookie: { secure: false, sameSite: 'lax' },
};

const servers: Server[] = [];

async function startApp(
  prisma: PrismaStub,
  cache: CacheStore,
): Promise<string> {
  const app: Express = createApp({
    prisma,
    webOrigins: ['http://localhost:3000'],
    auth,
    cache,
    profileCacheTtlSeconds: 300,
  });
  const server = app.listen(0);
  servers.push(server);
  await once(server, 'listening');
  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Expected a TCP server address');
  }

  return `http://127.0.0.1:${address.port}`;
}

interface UserRecord {
  id: string;
  fullname: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
}

interface CacheStub {
  cache: CacheStore;
  store: Map<string, unknown>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
}

function createCacheStub(): CacheStub {
  const store = new Map<string, unknown>();
  const get = vi.fn(async (key: string) =>
    store.has(key) ? (store.get(key) as unknown) : null,
  );
  const set = vi.fn(async (key: string, value: unknown) => {
    store.set(key, value);
  });
  const remove = vi.fn(async (key: string) => {
    store.delete(key);
  });

  return {
    cache: { get, set, delete: remove } as unknown as CacheStore,
    store,
    get,
    set,
    delete: remove,
  };
}

function createPrismaStub(initial: UserRecord) {
  let user = { ...initial };

  const findUnique = vi.fn(async () => ({ ...user }));
  const update = vi.fn(
    async (args: { data: { fullname: string } }) => {
      user = { ...user, fullname: args.data.fullname };

      return { ...user };
    },
  );

  const prisma = {
    user: { findUnique, update },
  } as unknown as PrismaStub;

  return { prisma, findUnique, update };
}

function accessToken(): string {
  return issueTokenPair(
    { userId: 'user-1', email: 'avery@example.com' },
    auth.jwtSalt,
  ).accessToken;
}

function authHeaders(): { Cookie: string } {
  return { Cookie: `dm_access_token=${accessToken()}` };
}

describe('profile routes', () => {
  afterEach(async () => {
    await Promise.all(
      servers.splice(0).map(
        (server) =>
          new Promise<void>((resolve) => {
            server.close(() => resolve());
          }),
      ),
    );
    vi.restoreAllMocks();
  });

  it('serves GET /me from the cache after the first read', async () => {
    const { prisma, findUnique } = createPrismaStub({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isActive: true,
      isEmailVerified: true,
    });
    const { cache } = createCacheStub();
    const baseUrl = await startApp(prisma, cache);

    const first = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: authHeaders(),
    });
    const second = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: authHeaders(),
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    await expect(second.json()).resolves.toEqual({
      user: {
        id: 'user-1',
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        isEmailVerified: true,
      },
    });
    expect(findUnique).toHaveBeenCalledOnce();
  });

  it('updates the profile and invalidates the cached entry', async () => {
    const { prisma, findUnique, update } = createPrismaStub({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isActive: true,
      isEmailVerified: true,
    });
    const { cache, store } = createCacheStub();
    const baseUrl = await startApp(prisma, cache);

    const updateResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname: '  Avery Stone  ' }),
    });

    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toEqual({
      user: {
        id: 'user-1',
        fullname: 'Avery Stone',
        email: 'avery@example.com',
        isEmailVerified: true,
      },
    });
    expect(update).toHaveBeenCalledOnce();
    expect(store.has(profileCacheKey('user-1'))).toBe(false);

    const readResponse = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: authHeaders(),
    });

    expect(readResponse.status).toBe(200);
    await expect(readResponse.json()).resolves.toEqual({
      user: {
        id: 'user-1',
        fullname: 'Avery Stone',
        email: 'avery@example.com',
        isEmailVerified: true,
      },
    });
    expect(findUnique).toHaveBeenCalledTimes(2);
  });

  it('returns field errors for an invalid profile update', async () => {
    const { prisma, update } = createPrismaStub({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isActive: true,
      isEmailVerified: true,
    });
    const { cache } = createCacheStub();
    const baseUrl = await startApp(prisma, cache);

    const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullname: ' ' }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Validation failed',
      fieldErrors: { fullname: 'Full name is required.' },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('requires an access cookie to update the profile', async () => {
    const { prisma, update } = createPrismaStub({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isActive: true,
      isEmailVerified: true,
    });
    const { cache } = createCacheStub();
    const baseUrl = await startApp(prisma, cache);

    const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname: 'Avery Stone' }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated.',
    });
    expect(update).not.toHaveBeenCalled();
  });
});
