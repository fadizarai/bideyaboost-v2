import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';

export class NotificationsController {
    static getMyNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
        const notifications = await NotificationsService.getMyNotifications(req.user.id);
        sendResponse(res, 200, 'Notifications retrieved', notifications);
    });

    static markRead = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        const notification = await NotificationsService.markRead(id);
        sendResponse(res, 200, 'Notification marked as read', notification);
    });
}
