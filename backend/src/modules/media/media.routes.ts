import { Router } from 'express';
import { MediaController } from './media.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/upload', MediaController.upload);
router.get('/', MediaController.getMyMedia);
router.delete('/:id', MediaController.delete);

export default router;
