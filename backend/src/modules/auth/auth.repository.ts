import { Prisma } from '.prisma/client';
import prisma from '../../database/client';

export class AuthRepository {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                expert: true,
                admin: true,
                parent: true,
            },
        });
    }

    static async createWithRole(userData: any, role: string, roleData: any) {
        return prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: userData,
            });

            const roleEntityData = {
                userId: user.id,
                ...roleData,
            };

            if (role === 'STUDENT') {
                await tx.student.create({ data: roleEntityData });
            } else if (role === 'EXPERT') {
                await tx.expert.create({ data: roleEntityData });
            } else if (role === 'ADMIN') {
                await tx.admin.create({ data: roleEntityData });
            } else if (role === 'PARENT') {
                await tx.parent.create({ data: roleEntityData });
            }

            return user;
        });
    }
}
