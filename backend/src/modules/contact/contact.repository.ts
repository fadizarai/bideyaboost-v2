import prisma from '../../database/client';

export class ContactRepository {
    static async createSubmission(data: any) {
        return prisma.contact.create({
            data,
        });
    }

    static async findAll() {
        return prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}
