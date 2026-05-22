import { Worker, UnrecoverableError } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { rubricService } from '../services/rubric.service.js';
import { logger } from '../utils/logger.js';
import type { RubricInput } from '../services/rubric.service.js';

export function startRubricWorker(): Worker<RubricInput> {
  const worker = new Worker<RubricInput>(
    'rubric-generation',
    async (job) => {
      logger.info('Processing rubric generation job', { jobId: job.id, topic: job.data.topic });

      let result: Awaited<ReturnType<typeof rubricService.generate>>;
      try {
        result = await rubricService.generate(job.data);
      } catch (err) {
        const msg = (err as Error).message;
        if (msg.startsWith('GEMINI_SAFETY_BLOCK')) throw new UnrecoverableError(msg);
        throw err;
      }

      logger.info('Rubric generation complete', { jobId: job.id });
      return result;
    },
    { connection: redisClient },
  );

  worker.on('failed', (job, err) => {
    logger.error('Rubric generation job failed', { jobId: job?.id, error: err.message });
  });

  worker.on('error', (err) => {
    logger.error('Rubric worker internal error', { error: err.message });
  });

  logger.info('BullMQ rubric worker started');
  return worker;
}
