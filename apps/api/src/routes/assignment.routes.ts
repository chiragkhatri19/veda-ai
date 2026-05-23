import { Router } from 'express';
import type { RequestHandler } from 'express';
import { assignmentController } from '../controllers/assignment.controller.js';
import { generationRateLimiter } from '../middleware/rateLimiter.js';

const limiter = generationRateLimiter as unknown as RequestHandler;

const router = Router();

router.get('/', assignmentController.list);
router.post('/', limiter, assignmentController.create);
router.get('/:id', assignmentController.getById);
router.get('/:id/pdf', assignmentController.downloadPdf);
router.delete('/:id', assignmentController.deleteOne);
router.post('/:id/regenerate', limiter, assignmentController.regenerate);

export default router;
