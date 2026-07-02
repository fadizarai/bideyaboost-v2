import { Response, Request } from 'express';
import { FormsService } from './forms.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class FormsController {
    static create = catchAsync(async (req: AuthRequest, res: Response) => {
        const form = await FormsService.create(req.user.id, req.body);
        sendResponse(res, 201, 'Form created successfully', form);
    });

    static submit = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) {
            throw new AppError('Only students can submit form responses', 403);
        }
        const { formId } = req.params as { formId: string };
        const { responseData } = req.body;
        const response = await FormsService.registerResponse(formId, req.user.student.id, responseData);
        sendResponse(res, 201, 'Response submitted', response);
    });

    static getAll = catchAsync(async (req: Request, res: Response) => {
        const forms = await FormsService.listForms(req.query);
        sendResponse(res, 200, 'Forms retrieved', forms);
    });

    static getResponses = catchAsync(async (req: AuthRequest, res: Response) => {
        const { formId } = req.params as { formId: string };
        const responses = await FormsService.getResponses(formId);
        sendResponse(res, 200, 'Responses retrieved', responses);
    });
}
