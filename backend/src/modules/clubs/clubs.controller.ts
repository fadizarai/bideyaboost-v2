import { Response, Request } from 'express';
import { ClubsService } from './clubs.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class ClubsController {
    static create = catchAsync(async (req: AuthRequest, res: Response) => {
        const club = await ClubsService.createClub(req.user.id, req.body);
        sendResponse(res, 201, 'Club created', club);
    });

    static list = catchAsync(async (req: Request, res: Response) => {
        const clubs = await ClubsService.listClubs(req.query);
        sendResponse(res, 200, 'Clubs retrieved', clubs);
    });

    static getOne = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const club = await ClubsService.getClub(id);
        if (!club) throw new AppError('Club not found', 404);
        sendResponse(res, 200, 'Club retrieved', club);
    });
}
