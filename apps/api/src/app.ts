import { API_PREFIX } from '@documind/shared';
import cors from 'cors';
import express, { type Express } from 'express';
import type { PrismaClient } from './generated/prisma/client';
import { createHealthRouter } from './health/health.router';

export interface AppDependencies {
  prisma: PrismaClient;
  webOrigins: string[];
}

export function createApp({ prisma, webOrigins }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: webOrigins }));
  app.use(express.json({ limit: '1mb' }));

  app.use(`/${API_PREFIX}/health`, createHealthRouter(prisma));

  app.use((_request, response) => {
    response.status(404).json({ error: 'Not Found' });
  });

  return app;
}
