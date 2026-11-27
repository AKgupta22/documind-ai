import { API_PREFIX } from '@documind/shared';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import type { AuthConfig } from './config/auth';
import { DEFAULT_PROFILE_CACHE_TTL_SECONDS } from './config/cache';
import type { PrismaClient } from './generated/prisma/client';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';
import {
  createNoopCacheStore,
  type CacheStore,
} from './services/cache.service';

export interface AppDependencies {
  prisma: PrismaClient;
  webOrigins: string[];
  auth: AuthConfig;
  cache?: CacheStore;
  profileCacheTtlSeconds?: number;
}

export function createApp({
  prisma,
  webOrigins,
  auth,
  cache = createNoopCacheStore(),
  profileCacheTtlSeconds = DEFAULT_PROFILE_CACHE_TTL_SECONDS,
}: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: webOrigins, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.use(
    `/${API_PREFIX}`,
    createApiRouter(prisma, auth, cache, profileCacheTtlSeconds),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
