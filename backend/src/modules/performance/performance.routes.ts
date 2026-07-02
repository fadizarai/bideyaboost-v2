import { Router } from 'express';
import { PerformanceController } from './performance.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/progress', PerformanceController.getMyProgress);
router.patch('/goals', PerformanceController.updateGoals);
router.get('/tests', PerformanceController.getMyTests);
router.post('/tests', PerformanceController.recordTest);

export default router;
