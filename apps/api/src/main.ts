import { API_PREFIX } from '@documind/shared';
import { createApp } from './app';
import { loadConfig } from './config/env';
import { createPrismaClient } from './models/prisma.model';

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const prisma = createPrismaClient(config.databaseUrl);
  const app = createApp({ prisma, webOrigins: config.webOrigins });

  const server = app.listen(config.port, () => {
    console.log(
      `DocuMind API listening on http://localhost:${config.port}/${API_PREFIX}`,
    );
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received, shutting down`);

    server.close(() => {
      void prisma.$disconnect().finally(() => {
        process.exit(0);
      });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the DocuMind API', error);
  process.exit(1);
});
