import { AUTH_PATH } from '@documind/shared';
import { Router } from 'express';
import type { AuthConfig } from '../config/auth';
import type { PrismaClient } from '../generated/prisma/client';
import type { CacheStore } from '../services/cache.service';
import { createAuthRouter } from './auth.routes';
import { createHealthRouter } from './health.routes';

export function createApiRouter(
  prisma: PrismaClient,
  auth: AuthConfig,
  cache: CacheStore,
  profileCacheTtlSeconds: number,
): Router {
  const router = Router();

  router.use('/health', createHealthRouter(prisma));
  router.use(
    AUTH_PATH,
    createAuthRouter(prisma, auth, cache, profileCacheTtlSeconds),
  );

  return router;
}
