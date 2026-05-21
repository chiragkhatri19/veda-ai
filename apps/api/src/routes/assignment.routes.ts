import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', assignmentController.list);
router.post('/', assignmentController.create);
router.get('/:id', assignmentController.getById);
router.get('/:id/pdf', assignmentController.downloadPdf);
router.delete('/:id', assignmentController.deleteOne);
router.post('/:id/regenerate', assignmentController.regenerate);

export default router;
