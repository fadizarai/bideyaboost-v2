import { Response, Request } from 'express';
import { EventsService } from './events.service';
import { catchAsync } from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export class EventsController {
    static create = catchAsync(async (req: AuthRequest, res: Response) => {
        const event = await EventsService.createEvent(req.user.id, req.body);
        sendResponse(res, 201, 'Event created', event);
    });

    static getAll = catchAsync(async (req: Request, res: Response) => {
        const events = await EventsService.getAllEvents(req.query);
        sendResponse(res, 200, 'Events retrieved', events);
    });

    static getOne = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const event = await EventsService.getEventDetails(id);
        if (!event) throw new AppError('Event not found', 404);
        sendResponse(res, 200, 'Event retrieved', event);
    });

    static register = catchAsync(async (req: AuthRequest, res: Response) => {
        if (!req.user.student) {
            throw new AppError('Only students can register for events', 403);
        }
        const { eventId } = req.body;
        const registration = await EventsService.registerStudent(eventId, req.user.student.id);
        sendResponse(res, 201, 'Registered for event', registration);
    });
}
