import type { Express } from 'express';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.ts';
import type { AppDependencies } from '../../src/app.ts';
import type { AuthConfig } from '../../src/config/auth.ts';

type PrismaStub = AppDependencies['prisma'];

const testAuth: AuthConfig = {
  jwtSalt: 'test-jwt-salt',
  cookie: { secure: false, sameSite: 'lax' },
};

const servers: Server[] = [];

async function startApp(prisma: PrismaStub): Promise<string> {
  const app: Express = createApp({
    prisma,
    webOrigins: ['http://localhost:3000'],
    auth: testAuth,
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

interface StubOptions {
  existingUser?: { id: string } | null;
  createError?: unknown;
}

function prismaStub(options: StubOptions = {}): PrismaStub {
  const createdUser = {
    id: 'user-1',
    fullname: 'Avery Morgan',
    email: 'avery@example.com',
    isEmailVerified: false,
  };

  const userCreate = vi.fn(async () => {
    if (options.createError !== undefined) {
      throw options.createError;
    }

    return createdUser;
  });

  const emailVerificationCreate = vi.fn(async () => ({}));

  const transactionClient = {
    user: { create: userCreate },
    emailVerification: { create: emailVerificationCreate },
  };

  return {
    user: {
      findUnique: vi.fn(async () => options.existingUser ?? null),
    },
    $transaction: vi.fn(
      async (callback: (client: typeof transactionClient) => Promise<unknown>) =>
        callback(transactionClient),
    ),
  } as unknown as PrismaStub;
}

describe('auth routes', () => {
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

  it('creates an account and never returns the password', async () => {
    const baseUrl = await startApp(prismaStub());

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'Avery Morgan',
        email: 'AVERY@example.com',
        password: 'Password1',
      }),
    });
    const body = (await response.json()) as {
      user: {
        id: string;
        fullname: string;
        email: string;
        isEmailVerified: boolean;
      };
    };

    expect(response.status).toBe(201);
    expect(body.user).toEqual({
      id: 'user-1',
      fullname: 'Avery Morgan',
      email: 'avery@example.com',
      isEmailVerified: false,
    });
    expect(JSON.stringify(body)).not.toContain('Password1');
    expect(JSON.stringify(body)).not.toContain('password');
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('returns field errors for invalid input', async () => {
    const baseUrl = await startApp(prismaStub());

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: '',
        email: 'invalid',
        password: 'short',
      }),
    });
    const body = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string>;
    };

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
    expect(body.fieldErrors['fullname']).toBe('Full name is required.');
    expect(body.fieldErrors['email']).toBe('Enter a valid email address.');
  });

  it('returns 409 when the email already exists', async () => {
    const baseUrl = await startApp(
      prismaStub({ existingUser: { id: 'existing-user' } }),
    );

    const response = await fetch(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'Avery Morgan',
        email: 'avery@example.com',
        password: 'Password1',
      }),
    });
    const body = (await response.json()) as {
      error: string;
      fieldErrors: Record<string, string>;
    };

    expect(response.status).toBe(409);
    expect(body.error).toBe('An account with this email already exists.');
    expect(body.fieldErrors['email']).toBe('This email is already registered.');
  });
});
