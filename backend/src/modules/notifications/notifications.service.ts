import { NotificationsRepository } from './notifications.repository';

export class NotificationsService {
    static async notify(userId: string, title: string, content: string, type: string = 'INFO') {
        return NotificationsRepository.createNotification(userId, title, content, type);
    }

    static async getMyNotifications(userId: string) {
        return NotificationsRepository.findUserNotifications(userId);
    }

    static async markRead(id: string) {
        return NotificationsRepository.markAsRead(id);
    }
}
