import { Router } from 'express';
import { EventsController } from './events.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createEventSchema, registerEventSchema } from './events.validation';

const router = Router();

router.use(authMiddleware);

router.post('/', authorize('ADMIN', 'EXPERT'), validate(createEventSchema), EventsController.create);
router.get('/', EventsController.getAll);
router.post('/register', validate(registerEventSchema), EventsController.register);

export default router;
