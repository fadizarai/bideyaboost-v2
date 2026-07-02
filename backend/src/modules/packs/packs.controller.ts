import { Request, Response } from 'express';
import { PacksService } from './packs.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';

export class PacksController {
    static create = catchAsync(async (req: Request, res: Response) => {
        const pack = await PacksService.create(req.body);
        sendResponse(res, 201, 'Pack created', pack);
    });

    static getPacks = catchAsync(async (req: Request, res: Response) => {
        const packs = await PacksService.getPacks(req.query);
        sendResponse(res, 200, 'Packs retrieved', packs);
    });

    static purchase = catchAsync(async (req: AuthRequest, res: Response) => {
        const { packId } = req.body;
        const result = await PacksService.buyPack(req.user.id, packId);
        sendResponse(res, 200, 'Pack purchased', result);
    });
}
