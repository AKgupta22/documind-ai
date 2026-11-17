import type { HealthResponse } from '@documind/shared';
import type { PrismaClient } from '../generated/prisma/client';

export async function getHealth(prisma: PrismaClient): Promise<HealthResponse> {
  const database = await checkDatabase(prisma);

  return {
    status: database.status === 'up' ? 'ok' : 'error',
    service: 'documind-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database,
  };
}

async function checkDatabase(
  prisma: PrismaClient,
): Promise<HealthResponse['database']> {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'up',
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error: unknown) {
    console.error(
      '[health] Database check failed:',
      error instanceof Error ? error.message : String(error),
    );
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - startedAt),
    };
  }
}
