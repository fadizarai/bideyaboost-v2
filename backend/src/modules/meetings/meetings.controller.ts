import { Response } from 'express';
import { MeetingsService } from './meetings.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class MeetingsController {
    static book = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) {
            throw new AppError('Only students can book meetings', 403);
        }
        const meeting = await MeetingsService.bookMeeting(req.user.student.id, req.body);
        sendResponse(res, 201, 'Meeting booked', meeting);
    });

    static updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        const { status } = req.body;
        const meeting = await MeetingsService.updateStatus(id, status);
        sendResponse(res, 200, 'Meeting status updated', meeting);
    });

    static getMyMeetings = catchAsync(async (req: AuthRequest, res: Response) => {
        const role = req.user.student ? 'STUDENT' : 'EXPERT';
        const meetings = await MeetingsService.getMyMeetings(req.user.id, role);
        sendResponse(res, 200, 'Meetings retrieved', meetings);
    });

    static startVideo = catchAsync(async (req: AuthRequest, res: Response) => {
        const videoMeeting = await MeetingsService.scheduleVideoMeeting(req.user.id, req.body);
        sendResponse(res, 201, 'Video meeting scheduled', videoMeeting);
    });
}
