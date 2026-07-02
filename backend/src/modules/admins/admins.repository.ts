import prisma from '../../database/client';

export class AdminsRepository {
    static async addNote(adminId: string, data: any) {
        return prisma.adminNote.create({
            data: {
                ...data,
                adminId,
            },
        });
    }

    static async getNotes(adminId: string) {
        return prisma.adminNote.findMany({
            where: { adminId },
            orderBy: { date: 'desc' },
        });
    }

    static async updateNavConfig(data: any) {
        return prisma.navVisibilityConfig.upsert({
            where: { navItem: data.navItem },
            update: data,
            create: data,
        });
    }

    static async findUsers(filters: any) {
        return prisma.user.findMany({
            where: filters,
            include: {
                student: true,
                expert: true,
                parent: true,
                admin: true,
            },
        });
    }
}
