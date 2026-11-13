import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { getHealth } from './health.service';

export function createHealthRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', async (_request, response) => {
    const health = await getHealth(prisma);

    response
      .status(health.status === 'ok' ? 200 : 503)
      .json(health);
  });

  return router;
}
