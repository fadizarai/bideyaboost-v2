import { EventsRepository } from './events.repository';

export class EventsService {
    static async createEvent(creatorId: string, data: any) {
        return EventsRepository.create({
            ...data,
            creatorId,
        });
    }

    static async getAllEvents(filters: any) {
        return EventsRepository.findAll(filters);
    }

    static async registerStudent(eventId: string, studentId: string) {
        return EventsRepository.registerStudent(eventId, studentId);
    }

    static async getEventDetails(id: string) {
        return EventsRepository.findById(id);
    }
}
