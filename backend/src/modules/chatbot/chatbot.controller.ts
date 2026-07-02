import { Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';

export class ChatbotController {
    static getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
        const history = await ChatbotService.getUserHistory(req.user.id);
        sendResponse(res, 200, 'Chat history retrieved', history);
    });

    static saveMessage = catchAsync(async (req: AuthRequest, res: Response) => {
        const { historyId, sender, text } = req.body;
        const message = await ChatbotService.saveMessage(historyId, sender, text);
        sendResponse(res, 201, 'Message saved', message);
    });

    static startSession = catchAsync(async (req: AuthRequest, res: Response) => {
        const session = await ChatbotService.getOrCreateHistory(req.user.id, req.user.student?.id);
        sendResponse(res, 201, 'Chat session started', session);
    });
}
