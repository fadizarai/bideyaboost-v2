import prisma from '../../database/client';

export class ClubsRepository {
    static async create(data: any) {
        return prisma.club.create({
            data,
        });
    }

    static async findAll(filters: any) {
        return prisma.club.findMany({
            where: filters,
            include: {
                creator: { select: { name: true, email: true } },
                events: true,
            },
        });
    }

    static async findById(id: string) {
        return prisma.club.findUnique({
            where: { id },
            include: {
                creator: true,
                events: true,
            },
        });
    }

    static async update(id: string, data: any) {
        return prisma.club.update({
            where: { id },
            data,
        });
    }
}
