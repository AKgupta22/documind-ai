import { hash } from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import type { AuthConfig } from '../../src/config/auth.ts';
import type { PrismaClient } from '../../src/generated/prisma/client.ts';
import {
  loginUser,
  logoutUser,
  refreshSession,
  validateLoginRequest,
} from '../../src/services/login.service.ts';
import {
  hashRefreshToken,
  issueTokenPair,
  verifyToken,
} from '../../src/services/token.service.ts';

const auth: AuthConfig = {
  jwtSalt: 'test-jwt-salt',
  cookie: { secure: false, sameSite: 'lax' },
};

interface UserRecord {
  id: string;
  fullname: string;
  email: string;
  password: string;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken: string | null;
}

function createPrismaStub(user: UserRecord | null) {
  const update = vi.fn(async () => ({}));
  const updateMany = vi.fn(async () => ({ count: 1 }));

  const prisma = {
    user: {
      findUnique: vi.fn(async () => user),
      update,
      updateMany,
    },
  } as unknown as PrismaClient;

  return { prisma, update, updateMany };
}

async function verifiedUser(
  overrides: Partial<UserRecord> = {},
): Promise<UserRecord> {
  return {
    id: 'user-1',
    fullname: 'Avery Morgan',
    email: 'avery@example.com',
    password: await hash('Password1', 4),
    isActive: true,
    isEmailVerified: true,
    refreshToken: null,
    ...overrides,
  };
}

describe('validateLoginRequest', () => {
  it('requires an email and password', () => {
    expect(validateLoginRequest({})).toEqual({
      ok: false,
      fieldErrors: {
        email: 'Email is required.',
        password: 'Password is required.',
      },
    });
  });

  it('rejects an invalid email', () => {
    expect(validateLoginRequest({ email: 'nope', password: 'Password1' })).toEqual(
      {
        ok: false,
        fieldErrors: { email: 'Enter a valid email address.' },
      },
    );
  });

  it('normalizes email casing and whitespace', () => {
    expect(
      validateLoginRequest({
        email: ' AVERY@Example.COM ',
        password: 'Password1',
      }),
    ).toEqual({
      ok: true,
      data: { email: 'avery@example.com', password: 'Password1' },
    });
  });
});

describe('loginUser', () => {
  it('issues access and refresh tokens with the expected lifetimes', async () => {
    const { prisma, update } = createPrismaStub(await verifiedUser());

    const result = await loginUser(
      prisma,
      { email: 'avery@example.com', password: 'Password1' },
      auth,
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected login to succeed');
    }

    const access = verifyToken(result.tokens.accessToken, auth.jwtSalt, 'access');
    const refresh = verifyToken(
      result.tokens.refreshToken,
      auth.jwtSalt,
      'refresh',
    );

    expect(access?.sub).toBe('user-1');
    expect(refresh?.sub).toBe('user-1');
    expect((access?.exp ?? 0) - (access?.iat ?? 0)).toBe(15 * 60);
    expect((refresh?.exp ?? 0) - (refresh?.iat ?? 0)).toBe(30 * 60);
    expect(verifyToken(result.tokens.refreshToken, auth.jwtSalt, 'access')).toBeNull();

    const updateCall = update.mock.calls[0]?.[0] as
      | { data?: { refreshToken?: string } }
      | undefined;
    expect(updateCall?.data?.refreshToken).toBe(
      hashRefreshToken(result.tokens.refreshToken),
    );
    expect(updateCall?.data?.refreshToken).not.toBe(result.tokens.refreshToken);
  });

  it('rejects an unknown email without revealing the account', async () => {
    const { prisma, update } = createPrismaStub(null);

    await expect(
      loginUser(
        prisma,
        { email: 'missing@example.com', password: 'Password1' },
        auth,
      ),
    ).resolves.toEqual({ ok: false, reason: 'invalid-credentials' });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a wrong password', async () => {
    const { prisma } = createPrismaStub(await verifiedUser());

    await expect(
      loginUser(
        prisma,
        { email: 'avery@example.com', password: 'WrongPassword1' },
        auth,
      ),
    ).resolves.toEqual({ ok: false, reason: 'invalid-credentials' });
  });

  it('blocks login immediately after signup until the email is verified', async () => {
    const { prisma, update } = createPrismaStub(
      await verifiedUser({ isEmailVerified: false }),
    );

    await expect(
      loginUser(
        prisma,
        { email: 'avery@example.com', password: 'Password1' },
        auth,
      ),
    ).resolves.toEqual({ ok: false, reason: 'email-unverified' });
    expect(update).not.toHaveBeenCalled();
  });

  it('blocks an inactive account', async () => {
    const { prisma } = createPrismaStub(await verifiedUser({ isActive: false }));

    await expect(
      loginUser(
        prisma,
        { email: 'avery@example.com', password: 'Password1' },
        auth,
      ),
    ).resolves.toEqual({ ok: false, reason: 'account-inactive' });
  });
});

describe('refreshSession', () => {
  it('rotates tokens when the stored refresh token matches', async () => {
    const tokens = issueTokenPair(
      { userId: 'user-1', email: 'avery@example.com' },
      auth.jwtSalt,
    );
    const { prisma, update } = createPrismaStub(
      await verifiedUser({ refreshToken: hashRefreshToken(tokens.refreshToken) }),
    );

    const result = await refreshSession(prisma, tokens.refreshToken, auth);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected refresh to succeed');
    }

    expect(result.tokens.refreshToken).not.toBe(tokens.refreshToken);
    expect(update).toHaveBeenCalledOnce();
  });

  it('rejects an unknown or mismatched refresh token', async () => {
    const tokens = issueTokenPair(
      { userId: 'user-1', email: 'avery@example.com' },
      auth.jwtSalt,
    );
    const { prisma, update } = createPrismaStub(
      await verifiedUser({ refreshToken: 'different-hash' }),
    );

    await expect(
      refreshSession(prisma, tokens.refreshToken, auth),
    ).resolves.toEqual({ ok: false, reason: 'invalid-refresh-token' });
    expect(update).not.toHaveBeenCalled();

    await expect(refreshSession(prisma, 'not-a-token', auth)).resolves.toEqual({
      ok: false,
      reason: 'invalid-refresh-token',
    });
  });
});

describe('logoutUser', () => {
  it('clears the stored refresh token when it matches', async () => {
    const tokens = issueTokenPair(
      { userId: 'user-1', email: 'avery@example.com' },
      auth.jwtSalt,
    );
    const { prisma, updateMany } = createPrismaStub(
      await verifiedUser({ refreshToken: hashRefreshToken(tokens.refreshToken) }),
    );

    await logoutUser(prisma, tokens.refreshToken, auth);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
        refreshToken: hashRefreshToken(tokens.refreshToken),
      },
      data: { refreshToken: null },
    });
  });

  it('does nothing for an invalid refresh token', async () => {
    const { prisma, updateMany } = createPrismaStub(await verifiedUser());

    await logoutUser(prisma, 'not-a-token', auth);

    expect(updateMany).not.toHaveBeenCalled();
  });
});
