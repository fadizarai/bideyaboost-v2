import { Response, Request } from 'express';
import { ExpertsService } from './experts.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class ExpertsController {
    static updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.expert) {
            throw new AppError('Only experts can update expert profiles', 403);
        }
        const profile = await ExpertsService.updateExpertProfile(req.user.id, req.body);
        sendResponse(res, 200, 'Profile updated', profile);
    });

    static getDetails = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const expert = await ExpertsService.getExpertDetails(id);
        if (!expert) throw new AppError('Expert not found', 404);
        sendResponse(res, 200, 'Expert details retrieved', expert);
    });

    static list = catchAsync(async (req: Request, res: Response) => {
        const experts = await ExpertsService.listExperts(req.query);
        sendResponse(res, 200, 'Experts retrieved', experts);
    });
}
