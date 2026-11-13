import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from '../src/health/health.service.ts';
import type { AppDependencies } from '../src/app.ts';

type PrismaStub = AppDependencies['prisma'];

function prismaStub(query: () => Promise<unknown>): PrismaStub {
  return { $queryRaw: vi.fn(query) } as unknown as PrismaStub;
}

describe('getHealth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports ok when the database answers', async () => {
    const health = await getHealth(prismaStub(async () => [{ '?column?': 1 }]));

    expect(health.status).toBe('ok');
    expect(health.service).toBe('documind-api');
    expect(health.database.status).toBe('up');
    expect(health.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(new Date(health.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('reports degraded when the database fails without leaking the error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const health = await getHealth(
      prismaStub(async () => {
        throw new Error('password authentication failed for user "secret"');
      }),
    );

    expect(health.status).toBe('error');
    expect(health.database.status).toBe('down');
    expect(JSON.stringify(health)).not.toContain('password authentication failed');
    expect(consoleSpy).toHaveBeenCalledOnce();
  });
});
