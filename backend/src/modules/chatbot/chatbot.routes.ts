import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/history', ChatbotController.getHistory);
router.post('/message', ChatbotController.saveMessage);
router.post('/session', ChatbotController.startSession);

export default router;
