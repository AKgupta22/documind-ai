import { API_PREFIX } from '@documind/shared';
import { createApp } from './app';
import { loadConfig, type AppConfig } from './config/env';
import { createPrismaClient } from './models/prisma.model';
import { createRedisClient, type RedisClient } from './models/redis.model';
import {
  createNoopCacheStore,
  createRedisCacheStore,
  type CacheStore,
} from './services/cache.service';

interface CacheSetup {
  cache: CacheStore;
  client?: RedisClient;
}

function createCache(config: AppConfig): CacheSetup {
  const url = config.cache.url;

  if (url === undefined) {
    console.log('REDIS_URL is not set; profile caching is disabled');
    return { cache: createNoopCacheStore() };
  }

  const client = createRedisClient(url);

  void client
    .connect()
    .then(() => {
      console.log('Redis profile cache connected');
    })
    .catch((error: unknown) => {
      console.error(
        'Redis profile cache connection failed; continuing without caching',
        error,
      );
    });

  return { cache: createRedisCacheStore(client), client };
}

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const prisma = createPrismaClient(config.databaseUrl);
  const { cache, client: redisClient } = createCache(config);
  const app = createApp({
    prisma,
    webOrigins: config.webOrigins,
    auth: { jwtSalt: config.jwtSalt, cookie: config.cookie },
    cache,
    profileCacheTtlSeconds: config.cache.profileTtlSeconds,
  });

  const server = app.listen(config.port, () => {
    console.log(
      `DocuMind API listening on http://localhost:${config.port}/${API_PREFIX}`,
    );
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received, shutting down`);

    server.close(() => {
      void Promise.allSettled([
        prisma.$disconnect(),
        redisClient === undefined ? Promise.resolve() : redisClient.close(),
      ]).finally(() => {
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
