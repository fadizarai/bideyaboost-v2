import { Response } from 'express';
import { AdminsService } from './admins.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class AdminsController {
    static addNote = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.admin) {
            throw new AppError('Only admins can add notes', 403);
        }
        const note = await AdminsService.createNote(req.user.admin.id, req.body);
        sendResponse(res, 201, 'Note added', note);
    });

    static getMyNotes = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.admin) {
            throw new AppError('Only admins can access notes', 403);
        }
        const notes = await AdminsService.getAdminNotes(req.user.admin.id);
        sendResponse(res, 200, 'Notes retrieved', notes);
    });

    static setNavConfig = catchAsync(async (req: AuthRequest, res: Response) => {
        const config = await AdminsService.configureNavigation(req.body);
        sendResponse(res, 201, 'Navigation config updated', config);
    });

    static getAllUsers = catchAsync(async (req: AuthRequest, res: Response) => {
        const users = await AdminsService.listAllUsers(req.query);
        sendResponse(res, 200, 'Users retrieved', users);
    });
}
