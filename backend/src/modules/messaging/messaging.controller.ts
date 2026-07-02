import { Response } from 'express';
import { MessagingService } from './messaging.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';

export class MessagingController {
    static startConversation = catchAsync(async (req: AuthRequest, res: Response) => {
        const conversation = await MessagingService.startConversation({
            ...req.body,
            senderId: req.user.id
        });
        sendResponse(res, 201, 'Conversation started', conversation);
    });

    static getMyConversations = catchAsync(async (req: AuthRequest, res: Response) => {
        const conversations = await MessagingService.getUserConversations(req.user.id);
        sendResponse(res, 200, 'Conversations retrieved', conversations);
    });

    static sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        const message = await MessagingService.sendMessage({
            ...req.body,
            conversationId: id,
            senderId: req.user.id
        });
        sendResponse(res, 201, 'Message sent', message);
    });

    static getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const messages = await MessagingService.getConversationMessages(id, page, limit);
        sendResponse(res, 200, 'Messages retrieved', messages);
    });

    static markRead = catchAsync(async (req: AuthRequest, res: Response) => {
        const { id } = req.params as { id: string };
        await MessagingService.markSeen(id, req.user.id);
        sendResponse(res, 200, 'Conversation marked as read');
    });
}
