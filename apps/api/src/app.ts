import { API_PREFIX } from '@documind/shared';
import cors from 'cors';
import express, { type Express } from 'express';
import type { PrismaClient } from './generated/prisma/client';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';

export interface AppDependencies {
  prisma: PrismaClient;
  webOrigins: string[];
}

export function createApp({ prisma, webOrigins }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: webOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.use(`/${API_PREFIX}`, createApiRouter(prisma));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
