import { Router } from 'express';
import { FormsController } from './forms.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', FormsController.getAll);
router.post('/', authMiddleware, authorize('ADMIN', 'EXPERT'), FormsController.create);
router.post('/:formId/submit', authMiddleware, FormsController.submit);
router.get('/:formId/responses', authMiddleware, authorize('ADMIN', 'EXPERT'), FormsController.getResponses);

export default router;
