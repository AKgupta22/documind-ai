import { Router } from 'express';
import type { AuthConfig } from '../config/auth';
import {
  createLoginController,
  createLogoutController,
  createMeController,
  createRefreshController,
  createSignupController,
  createUpdateMeController,
} from '../controllers/auth.controller';
import type { PrismaClient } from '../generated/prisma/client';
import type { CacheStore } from '../services/cache.service';

export function createAuthRouter(
  prisma: PrismaClient,
  auth: AuthConfig,
  cache: CacheStore,
  profileCacheTtlSeconds: number,
): Router {
  const router = Router();

  router.post('/signup', createSignupController(prisma));
  router.post('/login', createLoginController(prisma, auth));
  router.get(
    '/me',
    createMeController(prisma, auth, cache, profileCacheTtlSeconds),
  );
  router.patch(
    '/me',
    createUpdateMeController(prisma, auth, cache, profileCacheTtlSeconds),
  );
  router.post('/refresh', createRefreshController(prisma, auth));
  router.post('/logout', createLogoutController(prisma, auth));

  return router;
}
