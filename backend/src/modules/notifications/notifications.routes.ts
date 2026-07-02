import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', NotificationsController.getMyNotifications);
router.patch('/:id/read', NotificationsController.markRead);

export default router;
