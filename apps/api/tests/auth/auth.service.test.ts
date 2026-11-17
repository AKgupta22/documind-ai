import { compare } from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../src/generated/prisma/client';
import { signupUser } from '../../src/services/auth.service.ts';

interface UserCreateData {
  fullname: string;
  email: string;
  password: string;
}

interface UserCreateCall {
  data: UserCreateData;
}

interface EmailVerificationCreateCall {
  data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  };
}

interface StubOptions {
  existingUser?: { id: string } | null;
  createError?: unknown;
}

function createPrismaStub(options: StubOptions = {}) {
  const createdUser = {
    id: 'user-1',
    fullname: 'Avery Morgan',
    email: 'avery@example.com',
    isEmailVerified: false,
  };

  const userCreate = vi.fn(async (args: UserCreateCall) => {
    void args;

    if (options.createError !== undefined) {
      throw options.createError;
    }

    return createdUser;
  });

  const emailVerificationCreate = vi.fn(
    async (_args: EmailVerificationCreateCall) => ({}),
  );

  const transactionClient = {
    user: { create: userCreate },
    emailVerification: { create: emailVerificationCreate },
  };

  const findUnique = vi.fn(async () => options.existingUser ?? null);

  const prisma = {
    user: { findUnique },
    $transaction: vi.fn(
      async (callback: (client: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    ),
  };

  return {
    prisma: prisma as unknown as PrismaClient,
    findUnique,
    userCreate,
    emailVerificationCreate,
  };
}

describe('signupUser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hashes the password with bcrypt cost 8 and stores a link-style verification token', async () => {
    const { prisma, userCreate, emailVerificationCreate } = createPrismaStub();

    const result = await signupUser(prisma, {
      fullname: '  Avery Morgan ',
      email: ' AVERY@Example.COM ',
      password: 'Password1',
    });

    expect(result).toEqual({
      ok: true,
      user: {
        id: 'user-1',
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        isEmailVerified: false,
      },
    });

    const createCall = userCreate.mock.calls[0]?.[0];
    expect(createCall).toBeDefined();

    if (!createCall) {
      throw new Error('Expected user.create to be called');
    }

    expect(createCall.data.fullname).toBe('Avery Morgan');
    expect(createCall.data.email).toBe('avery@example.com');
    expect(createCall.data.password).not.toBe('Password1');
    expect(createCall.data.password).toMatch(/^\$2[aby]\$08\$/);
    await expect(compare('Password1', createCall.data.password)).resolves.toBe(
      true,
    );

    const verificationCall = emailVerificationCreate.mock.calls[0]?.[0];
    expect(verificationCall).toBeDefined();

    if (!verificationCall) {
      throw new Error('Expected emailVerification.create to be called');
    }

    expect(verificationCall.data.userId).toBe('user-1');
    expect(verificationCall.data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(verificationCall.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects an email that is already registered', async () => {
    const { prisma, findUnique, userCreate, emailVerificationCreate } =
      createPrismaStub({ existingUser: { id: 'existing-user' } });

    const result = await signupUser(prisma, {
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'Password1',
    });

    expect(result).toEqual({ ok: false, reason: 'email-taken' });
    expect(findUnique).toHaveBeenCalledOnce();
    expect(userCreate).not.toHaveBeenCalled();
    expect(emailVerificationCreate).not.toHaveBeenCalled();
  });

  it('maps a unique constraint race to an already-registered email', async () => {
    const { prisma } = createPrismaStub({ createError: { code: 'P2002' } });

    const result = await signupUser(prisma, {
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      password: 'Password1',
    });

    expect(result).toEqual({ ok: false, reason: 'email-taken' });
  });

  it('rethrows unexpected database errors', async () => {
    const { prisma } = createPrismaStub({
      createError: new Error('database unavailable'),
    });

    await expect(
      signupUser(prisma, {
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        password: 'Password1',
      }),
    ).rejects.toThrow('database unavailable');
  });
});
