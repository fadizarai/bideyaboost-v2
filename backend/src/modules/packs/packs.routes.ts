import { Router } from 'express';
import { PacksController } from './packs.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', PacksController.getPacks);
router.post('/', authMiddleware, authorize('ADMIN'), PacksController.create);
router.post('/purchase', authMiddleware, PacksController.purchase);

export default router;
