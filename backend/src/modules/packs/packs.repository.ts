import prisma from '../../database/client';

export class PacksRepository {
    static async createPack(data: any) {
        return prisma.pack.create({
            data,
        });
    }

    static async findAllPacks(filters: any) {
        return prisma.pack.findMany({
            where: filters,
        });
    }

    static async purchasePack(userId: string, packId: string) {
        // In a real app, integrate with payment here. 
        // For now, we just link it or add a record if needed.
        return { userId, packId, status: 'SUCCESS' };
    }
}
