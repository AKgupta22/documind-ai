import { createClient, type RedisClientType } from 'redis';

export type RedisClient = RedisClientType;

export function createRedisClient(url: string): RedisClient {
  const client = createClient({
    url,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: (retries) => Math.min(retries * 200, 3000),
    },
  });

  client.on('error', (error: unknown) => {
    console.error('Redis client error', error);
  });

  return client;
}
