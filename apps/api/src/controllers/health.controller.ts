import type { RequestHandler } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { getHealth } from '../services/health.service';

export function createHealthController(prisma: PrismaClient): RequestHandler {
  return async (_request, response) => {
    const health = await getHealth(prisma);

    response.status(health.status === 'ok' ? 200 : 503).json(health);
  };
}
