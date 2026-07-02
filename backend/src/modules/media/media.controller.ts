import { Response } from 'express';
import { MediaService } from './media.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';

export class MediaController {
    static upload = catchAsync(async (req: AuthRequest, res: Response) => {
        const media = await MediaService.uploadMedia(req.user.id, req.body);
        sendResponse(res, 201, 'Media metadata created', media);
    });

    static getMyMedia = catchAsync(async (req: AuthRequest, res: Response) => {
        const media = await MediaService.getMyMedia(req.user.id);
        sendResponse(res, 200, 'Media retrieved', media);
    });

    static delete = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        await MediaService.removeMedia(id);
        sendResponse(res, 204, 'Media deleted');
    });
}
