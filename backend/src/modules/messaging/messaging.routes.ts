import { Router } from 'express';
import { MessagingController } from './messaging.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createConversationSchema, sendMessageSchema } from './messaging.validation';

const router = Router();

router.use(authMiddleware);

router.post('/conversations', validate(createConversationSchema), MessagingController.startConversation);
router.get('/conversations', MessagingController.getMyConversations);
router.post('/conversations/:conversationId/messages', validate(sendMessageSchema), MessagingController.sendMessage);
router.get('/conversations/:conversationId/messages', MessagingController.getMessages);

export default router;
