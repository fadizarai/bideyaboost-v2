import prisma from '../../database/client';

export class NotificationsRepository {
    static async createNotification(userId: string, title: string, message: string, type: string, relatedEntity?: any, actionUrl?: string) {
        return prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                relatedEntity,
                actionUrl,
            },
        });
    }

    static async findUserNotifications(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async markAsRead(id: string) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
}
