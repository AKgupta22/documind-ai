import { describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../src/generated/prisma/client.ts';
import type { CacheStore } from '../../src/services/cache.service.ts';
import {
  getProfile,
  profileCacheKey,
  updateProfile,
  validateUpdateProfileRequest,
  type ProfileRecord,
} from '../../src/services/profile.service.ts';

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

function profile(overrides: Partial<ProfileRecord> = {}): ProfileRecord {
  return {
    id: 'user-1',
    fullname: 'Avery Morgan',
    email: 'avery@example.com',
    isActive: true,
    isEmailVerified: true,
    ...overrides,
  };
}

function createPrismaStub(record: ProfileRecord | null) {
  const findUnique = vi.fn(async () => record);
  const update = vi.fn(
    async (args: { data: { fullname: string } }) =>
      profile({ fullname: args.data.fullname }),
  );

  const prisma = {
    user: { findUnique, update },
  } as unknown as PrismaClient;

  return { prisma, findUnique, update };
}

describe('validateUpdateProfileRequest', () => {
  it('requires a full name', () => {
    expect(validateUpdateProfileRequest({})).toEqual({
      ok: false,
      fieldErrors: { fullname: 'Full name is required.' },
    });
  });

  it('rejects names shorter than two characters', () => {
    expect(validateUpdateProfileRequest({ fullname: ' A ' })).toEqual({
      ok: false,
      fieldErrors: { fullname: 'Full name must be at least 2 characters.' },
    });
  });

  it('trims whitespace and accepts a valid name', () => {
    expect(validateUpdateProfileRequest({ fullname: '  Avery Morgan  ' })).toEqual(
      {
        ok: true,
        data: { fullname: 'Avery Morgan' },
      },
    );
  });

  it('rejects names longer than 100 characters', () => {
    expect(validateUpdateProfileRequest({ fullname: 'a'.repeat(101) })).toEqual({
      ok: false,
      fieldErrors: {
        fullname: 'Full name must be at most 100 characters.',
      },
    });
  });
});

describe('getProfile', () => {
  it('reads from the database and caches the profile on a miss', async () => {
    const { cache, set } = createCacheStub();
    const { prisma, findUnique } = createPrismaStub(profile());

    const result = await getProfile(prisma, cache, 'user-1', 300);

    expect(result).toEqual(profile());
    expect(findUnique).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(profileCacheKey('user-1'), profile(), 300);
  });

  it('returns the cached profile without querying the database', async () => {
    const { cache, store } = createCacheStub();
    store.set(profileCacheKey('user-1'), profile({ fullname: 'Cached Name' }));
    const { prisma, findUnique } = createPrismaStub(profile());

    const result = await getProfile(prisma, cache, 'user-1', 300);

    expect(result?.fullname).toBe('Cached Name');
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('returns null when the user does not exist', async () => {
    const { cache, set } = createCacheStub();
    const { prisma } = createPrismaStub(null);

    await expect(getProfile(prisma, cache, 'missing', 300)).resolves.toBeNull();
    expect(set).not.toHaveBeenCalled();
  });
});

describe('updateProfile', () => {
  it('updates the user and removes the cached profile', async () => {
    const { cache, delete: remove } = createCacheStub();
    const { prisma, update } = createPrismaStub(profile());

    const result = await updateProfile(prisma, cache, 'user-1', {
      fullname: 'New Name',
    });

    expect(result?.fullname).toBe('New Name');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { fullname: 'New Name' },
      select: {
        id: true,
        fullname: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
      },
    });
    expect(remove).toHaveBeenCalledWith(profileCacheKey('user-1'));
  });

  it('returns null when the user no longer exists', async () => {
    const { cache } = createCacheStub();
    const prisma = {
      user: {
        update: vi.fn(async () => {
          throw { code: 'P2025' };
        }),
      },
    } as unknown as PrismaClient;

    await expect(
      updateProfile(prisma, cache, 'missing', { fullname: 'New Name' }),
    ).resolves.toBeNull();
  });

  it('rethrows unexpected database errors', async () => {
    const { cache } = createCacheStub();
    const prisma = {
      user: {
        update: vi.fn(async () => {
          throw new Error('database down');
        }),
      },
    } as unknown as PrismaClient;

    await expect(
      updateProfile(prisma, cache, 'user-1', { fullname: 'New Name' }),
    ).rejects.toThrow('database down');
  });
});
