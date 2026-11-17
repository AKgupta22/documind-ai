import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { createHealthRouter } from './health.routes';

export function createApiRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.use('/health', createHealthRouter(prisma));

  return router;
}
