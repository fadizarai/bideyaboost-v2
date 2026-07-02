import prisma from '../../database/client';

export class ExpertsRepository {
    static async updateProfile(userId: string, data: any) {
        return prisma.expert.update({
            where: { userId },
            data,
        });
    }

    static async findById(id: string) {
        return prisma.expert.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
    }

    static async findAll(filters: any) {
        return prisma.expert.findMany({
            where: filters,
            include: {
                user: { select: { name: true, email: true } },
            },
        });
    }
}
