import prisma from '../../database/client';

export class ActivitiesRepository {
    static async logActivity(userId: string, activityType: string, action: string, metadata?: any) {
        return prisma.userActivity.create({
            data: {
                userId,
                activityType,
                action,
                metadata,
            },
        });
    }

    static async findUserActivities(userId: string) {
        return prisma.userActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
}
