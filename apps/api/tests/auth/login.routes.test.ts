import type { Express } from 'express';
import { hash } from 'bcryptjs';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import type { AppDependencies } from '../../src/app.ts';
import type { AuthConfig } from '../../src/config/auth.ts';

type PrismaStub = AppDependencies['prisma'];

const auth: AuthConfig = {
  jwtSalt: 'test-jwt-salt',
  cookie: { secure: false, sameSite: 'lax' },
};

const servers: Server[] = [];

async function startApp(prisma: PrismaStub): Promise<string> {
  const app: Express = createApp({
    prisma,
    webOrigins: ['http://localhost:3000'],
    auth,
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
  password: string;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken: string | null;
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

function prismaStub(user: UserRecord | null) {
  const update = vi.fn(
    async (args: { data?: { refreshToken?: string | null } }) => {
      if (user !== null && args.data !== undefined) {
        user.refreshToken = args.data.refreshToken ?? null;
      }

      return {};
    },
  );
  const updateMany = vi.fn(async () => ({ count: 1 }));

  const prisma = {
    user: {
      findUnique: vi.fn(async () => user),
      update,
      updateMany,
    },
  } as unknown as PrismaStub;

  return { prisma, updateMany };
}

function cookieValue(setCookie: string, name: string): string | undefined {
  const prefix = `${name}=`;
  const header = setCookie
    .split(/,(?=\s*[a-zA-Z0-9_-]+=)/)
    .find((entry) => entry.trimStart().startsWith(prefix));

  if (header === undefined) {
    return undefined;
  }

  return header.trimStart().slice(prefix.length).split(';')[0];
}

describe('login routes', () => {
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

  it('sets httpOnly access and refresh cookies with the configured lifetimes', async () => {
    const { prisma } = prismaStub(await verifiedUser());
    const baseUrl = await startApp(prisma);

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify({
        email: 'AVERY@example.com',
        password: 'Password1',
      }),
    });
    const body = (await response.json()) as {
      user: { id: string; email: string };
    };
    const setCookies = response.headers.getSetCookie();

    expect(response.status).toBe(200);
    expect(body.user).toEqual({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isEmailVerified: true,
    });
    expect(JSON.stringify(body)).not.toContain('Token');

    const accessCookie = setCookies.find((entry) =>
      entry.startsWith('dm_access_token='),
    );
    const refreshCookie = setCookies.find((entry) =>
      entry.startsWith('dm_refresh_token='),
    );

    expect(accessCookie).toContain('HttpOnly');
    expect(accessCookie).toContain('Max-Age=900');
    expect(accessCookie).toContain('SameSite=Lax');
    expect(accessCookie).toContain('Path=/');
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Max-Age=1800');
    expect(refreshCookie).toContain('SameSite=Lax');

    expect(response.headers.get('access-control-allow-credentials')).toBe(
      'true',
    );
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:3000',
    );
  });

  it('blocks login until the signup email is verified', async () => {
    const { prisma } = prismaStub(
      await verifiedUser({ isEmailVerified: false }),
    );
    const baseUrl = await startApp(prisma);

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'avery@example.com',
        password: 'Password1',
      }),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'Verify your email before signing in.',
    });
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('returns 401 for invalid credentials without setting cookies', async () => {
    const { prisma } = prismaStub(await verifiedUser());
    const baseUrl = await startApp(prisma);

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'avery@example.com',
        password: 'WrongPassword1',
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Email or password is incorrect.',
    });
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('returns field errors for invalid input', async () => {
    const { prisma } = prismaStub(null);
    const baseUrl = await startApp(prisma);

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid', password: '' }),
    });
    const body = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string>;
    };

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
    expect(body.fieldErrors['email']).toBe('Enter a valid email address.');
    expect(body.fieldErrors['password']).toBe('Password is required.');
  });

  it('rotates the token pair using the refresh cookie', async () => {
    const { prisma } = prismaStub(await verifiedUser());
    const baseUrl = await startApp(prisma);

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'avery@example.com',
        password: 'Password1',
      }),
    });
    const loginCookies = loginResponse.headers.getSetCookie();
    const refreshSetCookie = loginCookies.find((entry) =>
      entry.startsWith('dm_refresh_token='),
    );

    expect(refreshSetCookie).toBeDefined();

    const refreshToken = cookieValue(
      refreshSetCookie ?? '',
      'dm_refresh_token',
    );
    expect(refreshToken).toBeDefined();

    const refreshResponse = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `dm_refresh_token=${refreshToken ?? ''}`,
      },
    });
    const refreshCookies = refreshResponse.headers.getSetCookie();

    expect(refreshResponse.status).toBe(200);
    expect(refreshCookies.some((entry) => entry.startsWith('dm_access_token='))).toBe(
      true,
    );
    expect(refreshCookies.some((entry) => entry.startsWith('dm_refresh_token='))).toBe(
      true,
    );

    const rotated = refreshCookies
      .find((entry) => entry.startsWith('dm_refresh_token='))
      ?.split(';')[0];

    expect(rotated).not.toBe(`dm_refresh_token=${refreshToken ?? ''}`);
  });

  it('clears cookies and revokes the refresh token on logout', async () => {
    const { prisma, updateMany } = prismaStub(await verifiedUser());
    const baseUrl = await startApp(prisma);

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'avery@example.com',
        password: 'Password1',
      }),
    });
    const refreshSetCookie = loginResponse.headers
      .getSetCookie()
      .find((entry) => entry.startsWith('dm_refresh_token='));
    const refreshToken = cookieValue(refreshSetCookie ?? '', 'dm_refresh_token');

    const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `dm_refresh_token=${refreshToken ?? ''}` },
    });
    const cleared = response.headers.getSetCookie();

    expect(response.status).toBe(204);
    expect(cleared).toHaveLength(2);
    expect(
      cleared.every(
        (entry) =>
          entry.includes('Expires=Thu, 01 Jan 1970') ||
          entry.includes('Max-Age=0'),
      ),
    ).toBe(true);
    expect(updateMany).toHaveBeenCalledOnce();
  });
});
