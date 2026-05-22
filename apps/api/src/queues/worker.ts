import { Worker, UnrecoverableError } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { Assignment } from '../models/assignment.model.js';
import { aiService } from '../services/ai.service.js';
import { parseAndValidateLLMResponse } from '../utils/responseParser.js';
import { emitJobProgress } from '../socket/socket.server.js';
import { logger } from '../utils/logger.js';
import type { JobProgressEvent } from '@veda/shared';
import type { GenerationJobData } from './queue.js';

async function emitCachedProgress(assignmentId: string, event: JobProgressEvent): Promise<void> {
  await redisClient.set(
    `assignment:progress:${assignmentId}`,
    JSON.stringify(event),
    'EX',
    600,
  );
  emitJobProgress(assignmentId, event);
}

export function startWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    'assignment-generation',
    async (job) => {
      const { assignmentId } = job.data;

      await emitCachedProgress(assignmentId, {
        status: 'processing',
        progress: 10,
        message: 'Received generation request',
      });

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment ${assignmentId} not found`);
      }

      await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'processing' });

      await emitCachedProgress(assignmentId, {
        status: 'processing',
        progress: 25,
        message: 'Building prompt from your input',
      });

      let rawResponse: string;
      try {
        rawResponse = await aiService.generateQuestionPaper(assignment);
      } catch (err) {
        const msg = (err as Error).message;
        // Safety blocks will not resolve on retry — fail the job immediately
        if (msg.startsWith('GEMINI_SAFETY_BLOCK')) throw new UnrecoverableError(msg);
        throw err;
      }

      await emitCachedProgress(assignmentId, {
        status: 'processing',
        progress: 70,
        message: 'Processing AI response',
      });

      const questionPaper = parseAndValidateLLMResponse(rawResponse);

      await emitCachedProgress(assignmentId, {
        status: 'processing',
        progress: 90,
        message: 'Saving to database',
      });

      await Assignment.findByIdAndUpdate(assignmentId, {
        jobStatus: 'completed',
        questionPaper,
      });

      await emitCachedProgress(assignmentId, {
        status: 'completed',
        progress: 100,
        message: 'Your question paper is ready',
        result: questionPaper,
      });
    },
    { connection: redisClient },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;

    logger.error('Generation job failed', { assignmentId, error: err.message });

    await Assignment.findByIdAndUpdate(assignmentId, { jobStatus: 'failed' });

    await emitCachedProgress(assignmentId, {
      status: 'failed',
      progress: 0,
      message: 'Generation failed. Please try again.',
      error: err.message,
    });
  });

  worker.on('error', (err) => {
    logger.error('Worker internal error', { error: err.message });
  });

  logger.info('BullMQ worker started');
  return worker;
}
