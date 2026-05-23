import { Queue } from 'bullmq';
import { redisClient } from '../config/redis.js';

export interface GenerationJobData {
  assignmentId: string;
  traceId?: string;
}

export const generationQueue = new Queue<GenerationJobData>('assignment-generation', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
