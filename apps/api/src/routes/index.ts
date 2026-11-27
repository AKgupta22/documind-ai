import { AUTH_PATH } from '@documind/shared';
import { Router } from 'express';
import type { AuthConfig } from '../config/auth';
import type { PrismaClient } from '../generated/prisma/client';
import { createAuthRouter } from './auth.routes';
import { createHealthRouter } from './health.routes';

export function createApiRouter(
  prisma: PrismaClient,
  auth: AuthConfig,
): Router {
  const router = Router();

  router.use('/health', createHealthRouter(prisma));
  router.use(AUTH_PATH, createAuthRouter(prisma, auth));

  return router;
}
