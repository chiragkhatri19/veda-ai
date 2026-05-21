import type { Request, Response, NextFunction } from 'express';
import { assignmentService } from '../services/assignment.service.js';
import { generateQuestionPaperPDF } from '../services/pdf.service.js';
import { generationQueue } from '../queues/queue.js';
import { CreateAssignmentSchema } from '../middleware/validate.middleware.js';
import { logger } from '../utils/logger.js';

export const assignmentController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignments = await assignmentService.findAll();
      res.json(assignments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await assignmentService.findById(req.params.id);
      if (!assignment) {
        res.status(404).json({ message: 'Assignment not found' });
        return;
      }
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = CreateAssignmentSchema.parse(req.body);
      const assignment = await assignmentService.create(data);

      await generationQueue.add('generate', { assignmentId: assignment.id });
      logger.info('Generation job queued', { assignmentId: assignment.id });

      res.status(202).json({
        message: 'Assignment generation has been enqueued.',
        assignmentId: assignment.id,
        status: 'queued',
        links: {
          status: `/api/assignments/${assignment.id}`,
          websocket: `assignment:${assignment.id}`,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await assignmentService.deleteById(req.params.id);
      if (!deleted) {
        res.status(404).json({ message: 'Assignment not found' });
        return;
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },

  async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await assignmentService.findById(req.params.id);
      if (!assignment) {
        res.status(404).json({ message: 'Assignment not found' });
        return;
      }
      if (!assignment.questionPaper) {
        res.status(409).json({ message: 'Question paper has not been generated yet' });
        return;
      }

      const pdfBuffer = await generateQuestionPaperPDF(assignment.questionPaper, assignment.title);
      const safeTitle = assignment.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  },

  async regenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assignment = await assignmentService.resetForRegeneration(req.params.id);
      if (!assignment) {
        res.status(404).json({ message: 'Assignment not found' });
        return;
      }

      await generationQueue.add('generate', { assignmentId: req.params.id });
      logger.info('Regeneration job queued', { assignmentId: req.params.id });

      res.status(202).json({
        message: 'Assignment regeneration has been enqueued.',
        assignmentId: req.params.id,
        status: 'queued',
        links: {
          status: `/api/assignments/${req.params.id}`,
          websocket: `assignment:${req.params.id}`,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
