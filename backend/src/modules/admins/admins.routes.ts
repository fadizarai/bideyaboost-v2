import { Router } from 'express';
import { AdminsController } from './admins.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createAdminNoteSchema, updateNavConfigSchema } from './admins.validation';

const router = Router();

router.use(authMiddleware);
router.use(authorize('ADMIN'));

router.post('/notes', validate(createAdminNoteSchema), AdminsController.addNote);
router.get('/notes', AdminsController.getMyNotes);
router.post('/nav-config', validate(updateNavConfigSchema), AdminsController.setNavConfig);
router.get('/users', AdminsController.getAllUsers);

export default router;
