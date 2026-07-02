import prisma from '../../database/client';

export class FormsRepository {
    static async createForm(creatorId: string, data: any) {
        return prisma.form.create({
            data: {
                ...data,
                creatorId,
            },
        });
    }

    static async submitResponse(data: any) {
        return prisma.formResponse.create({
            data,
        });
    }

    static async findForms(filters: any) {
        return prisma.form.findMany({
            where: filters,
        });
    }

    static async getFormResponses(formId: string) {
        return prisma.formResponse.findMany({
            where: { formId },
            include: {
                student: { include: { user: { select: { name: true } } } },
            },
        });
    }
}
