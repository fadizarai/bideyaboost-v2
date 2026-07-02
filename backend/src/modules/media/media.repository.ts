import prisma from '../../database/client';

export class MediaRepository {
    static async createMedia(creatorId: string, data: any) {
        return prisma.media.create({
            data: {
                ...data,
                creatorId,
            },
        });
    }

    static async findUserMedia(creatorId: string) {
        return prisma.media.findMany({
            where: { creatorId },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async deleteMedia(id: string) {
        return prisma.media.delete({
            where: { id },
        });
    }
}
