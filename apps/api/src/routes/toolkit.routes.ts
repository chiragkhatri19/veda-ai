import { Router } from 'express';
import { Queue } from 'bullmq';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const router = Router();

export const rubricQueue = new Queue('rubric-generation', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { count: 50 },
  },
});

router.post('/rubric', async (req, res, next) => {
  try {
    const { topic, subject, grade, assessmentType, totalMarks, numCriteria } = req.body as {
      topic: string;
      subject: string;
      grade: string;
      assessmentType: string;
      totalMarks: number;
      numCriteria: number;
    };

    if (!topic || !subject || !grade || !assessmentType || !totalMarks) {
      res.status(400).json({ message: 'topic, subject, grade, assessmentType, and totalMarks are required' });
      return;
    }

    const job = await rubricQueue.add('generate-rubric', {
      topic,
      subject,
      grade,
      assessmentType: assessmentType || 'Written Assignment',
      totalMarks: Number(totalMarks),
      numCriteria: Number(numCriteria) || 4,
    });

    logger.info('Rubric generation job queued', { jobId: job.id, topic });

    res.status(202).json({
      message: 'Rubric generation has been queued.',
      jobId: job.id,
      status: 'queued',
    });
  } catch (err) {
    next(err);
  }
});

router.get('/rubric/status/:jobId', async (req, res, next) => {
  try {
    const job = await rubricQueue.getJob(req.params.jobId);
    if (!job) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    const state = await job.getState();

    if (state === 'completed') {
      res.json({ status: 'completed', result: job.returnvalue });
    } else if (state === 'failed') {
      res.status(200).json({ status: 'failed', error: job.failedReason });
    } else {
      res.json({ status: 'processing' });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
