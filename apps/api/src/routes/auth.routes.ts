import { Router } from 'express';
import type { AuthConfig } from '../config/auth';
import {
  createLoginController,
  createLogoutController,
  createRefreshController,
  createSignupController,
} from '../controllers/auth.controller';
import type { PrismaClient } from '../generated/prisma/client';

export function createAuthRouter(
  prisma: PrismaClient,
  auth: AuthConfig,
): Router {
  const router = Router();

  router.post('/signup', createSignupController(prisma));
  router.post('/login', createLoginController(prisma, auth));
  router.post('/refresh', createRefreshController(prisma, auth));
  router.post('/logout', createLogoutController(prisma, auth));

  return router;
}
