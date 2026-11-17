import { Router } from 'express';
import type { PrismaClient } from '../generated/prisma/client';
import { createHealthController } from '../controllers/health.controller';

export function createHealthRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', createHealthController(prisma));

  return router;
}
