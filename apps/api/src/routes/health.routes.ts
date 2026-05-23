import { Router } from 'express';
import type { Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const mongoOk = mongoose.connection.readyState === 1;
  const redisOk = redisClient.status === 'ready';
  const healthy = mongoOk && redisOk;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'HEALTHY' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoOk ? 'UP' : 'DOWN',
      cache: redisOk ? 'UP' : 'DOWN',
    },
  });
});

export { router as healthRoutes };
