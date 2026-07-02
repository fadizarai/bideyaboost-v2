import { Router } from 'express';
import { ExpertsController } from './experts.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', ExpertsController.list);
router.get('/:id', ExpertsController.getDetails);
router.patch('/profile', authMiddleware, ExpertsController.updateProfile);

export default router;
