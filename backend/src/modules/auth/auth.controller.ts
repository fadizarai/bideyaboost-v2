import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';

export class AuthController {
    static register = catchAsync(async (req: Request, res: Response) => {
        const user = await AuthService.register(req.body);
        sendResponse(res, 201, 'User registered successfully', user);
    });

    static login = catchAsync(async (req: Request, res: Response) => {
        const result = await AuthService.login(req.body);
        sendResponse(res, 200, 'Login successful', result);
    });

    static refreshToken = catchAsync(async (req: Request, res: Response) => {
        // Refresh token logic here (can be added if user provides specific refresh logic)
        sendResponse(res, 200, 'Token refreshed');
    });
}
