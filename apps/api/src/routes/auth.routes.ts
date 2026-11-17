import { Router } from 'express';
import { createSignupController } from '../controllers/auth.controller';
import type { PrismaClient } from '../generated/prisma/client';

export function createAuthRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post('/signup', createSignupController(prisma));

  return router;
}
