import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error', { message: (err as Error).message });
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
});

export async function disconnectRedis(): Promise<void> {
  await redisClient.quit();
}
