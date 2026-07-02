import { Router } from 'express';
import { MeetingsController } from './meetings.controller';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createMeetingSchema, updateMeetingStatusSchema, createVideoMeetingSchema } from './meetings.validation';

const router = Router();

router.use(authMiddleware);

router.post('/book', authorize('STUDENT'), validate(createMeetingSchema), MeetingsController.book);
router.patch('/:id/status', authorize('EXPERT', 'ADMIN'), validate(updateMeetingStatusSchema), MeetingsController.updateStatus);
router.post('/video', authorize('ADMIN', 'EXPERT'), validate(createVideoMeetingSchema), MeetingsController.startVideo);
router.get('/my-meetings', MeetingsController.getMyMeetings);

export default router;
