import { Router } from 'express';
import { ClubsController } from './clubs.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', ClubsController.list);
router.get('/:id', ClubsController.getOne);
router.post('/', authMiddleware, ClubsController.create);

export default router;
