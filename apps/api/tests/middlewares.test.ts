import express, { type Express } from 'express';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../src/middlewares/error.middleware.ts';
import { notFoundHandler } from '../src/middlewares/not-found.middleware.ts';

const servers: Server[] = [];

async function startApp(app: Express): Promise<string> {
  const server = app.listen(0);
  servers.push(server);
  await once(server, 'listening');
  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Expected a TCP server address');
  }

  return `http://127.0.0.1:${address.port}`;
}

describe('API middlewares', () => {
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

  it('returns a JSON 404 for unknown routes', async () => {
    const app = express();
    app.use(notFoundHandler);

    const baseUrl = await startApp(app);
    const response = await fetch(`${baseUrl}/missing`);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Not Found' });
  });

  it('returns a generic JSON 500 without leaking the error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const app = express();
    app.get('/boom', () => {
      throw new Error('password authentication failed for user "secret"');
    });
    app.use(errorHandler);

    const baseUrl = await startApp(app);
    const response = await fetch(`${baseUrl}/boom`);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
    expect(JSON.stringify(body)).not.toContain('password authentication failed');
    expect(consoleSpy).toHaveBeenCalledOnce();
  });
});
