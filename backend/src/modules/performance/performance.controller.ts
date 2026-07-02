import { Response } from 'express';
import { PerformanceService } from './performance.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class PerformanceController {
    static recordTest = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student && !req.user.admin) {
            throw new AppError('Only students or admins can record tests', 403);
        }
        const studentId = req.user.student?.id || req.body.studentId;
        if (!studentId) throw new AppError('Student ID is required', 400);

        const result = await PerformanceService.recordTest(studentId, req.body);
        sendResponse(res, 201, 'Test result recorded', result);
    });

    static getMyProgress = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) throw new AppError('Only students have progress tracking', 403);
        const progress = await PerformanceService.getProgress(req.user.student.id);
        sendResponse(res, 200, 'Progress retrieved', progress);
    });

    static updateGoals = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) throw new AppError('Only students can update goals', 403);
        const progress = await PerformanceService.updateGoals(req.user.student.id, req.body.goals);
        sendResponse(res, 200, 'Goals updated', progress);
    });

    static getMyTests = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) throw new AppError('Only students can view their tests', 403);
        const tests = await PerformanceService.getTests(req.user.student.id);
        sendResponse(res, 200, 'Tests retrieved', tests);
    });
}
