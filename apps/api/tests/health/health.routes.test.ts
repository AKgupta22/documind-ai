import type { Express } from 'express';
import type { Server } from 'node:http';
import { once } from 'node:events';
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

function prismaStub(query: () => Promise<unknown>): PrismaStub {
  return { $queryRaw: vi.fn(query) } as unknown as PrismaStub;
}

describe('API routes', () => {
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

  it('returns 200 and health details when the database is up', async () => {
    const baseUrl = await startApp(prismaStub(async () => [{ '?column?': 1 }]));

    const response = await fetch(`${baseUrl}/api/v1/health`);
    const body = (await response.json()) as {
      status: string;
      service: string;
      database: { status: string };
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('documind-api');
    expect(body.database.status).toBe('up');
  });

  it('returns 503 when the database is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const baseUrl = await startApp(
      prismaStub(async () => {
        throw new Error('connection refused');
      }),
    );

    const response = await fetch(`${baseUrl}/api/v1/health`);
    const body = (await response.json()) as {
      status: string;
      database: { status: string };
    };

    expect(response.status).toBe(503);
    expect(body.status).toBe('error');
    expect(body.database.status).toBe('down');
    expect(JSON.stringify(body)).not.toContain('connection refused');
  });

  it('returns JSON 404 for unknown routes', async () => {
    const baseUrl = await startApp(prismaStub(async () => []));

    const response = await fetch(`${baseUrl}/api/v1/unknown`);
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not Found' });
  });
});
