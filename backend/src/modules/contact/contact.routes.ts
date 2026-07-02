import { Response, Request } from 'express';
import { ContactService } from './contact.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { authMiddleware, authorize } from '../../middleware/auth.middleware';
import { Router } from 'express';

export class ContactController {
    static submit = catchAsync(async (req: Request, res: Response) => {
        const submission = await ContactService.submitContactForm(req.body);
        sendResponse(res, 201, 'Submission received', submission);
    });

    static list = catchAsync(async (req: Request, res: Response) => {
        const submissions = await ContactService.getAllSubmissions();
        sendResponse(res, 200, 'Submissions retrieved', submissions);
    });
}

const router = Router();
router.post('/', ContactController.submit);
router.get('/', authMiddleware, authorize('ADMIN'), ContactController.list);

export default router;
