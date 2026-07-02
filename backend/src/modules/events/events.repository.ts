import { Prisma } from '@prisma/client';
import prisma from '../../database/client';
import { AppError } from '../../shared/errors/AppError';

export class EventsRepository {
    static async create(data: any) {
        return prisma.event.create({
            data,
        });
    }

    static async findAll(filters: any) {
        return prisma.event.findMany({
            where: {
                ...filters,
                deletedAt: null,
            },
            include: {
                club: { select: { clubName: true, photo: true } },
                creator: { select: { name: true } },
                _count: { select: { registrations: true } },
            },
        });
    }

    static async registerStudent(eventId: string, studentId: string) {
        return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const event = await tx.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { registrations: true } } },
            });

            if (!event) throw new AppError('Event not found', 404);
            if (!event.registrationToggle) throw new AppError('Registration is closed', 400);
            if (event.deadline && new Date() > event.deadline) throw new AppError('Registration deadline has passed', 400);
            if (event.maxRegistrations && event._count.registrations >= event.maxRegistrations) {
                throw new AppError('Event is at full capacity', 400);
            }

            return tx.eventRegistration.create({
                data: {
                    eventId,
                    studentId,
                },
            });
        });
    }

    static async findById(id: string) {
        return prisma.event.findUnique({
            where: { id },
            include: {
                club: true,
                registrations: {
                    include: {
                        student: { include: { user: { select: { name: true, email: true } } } }
                    }
                }
            }
        });
    }
}
