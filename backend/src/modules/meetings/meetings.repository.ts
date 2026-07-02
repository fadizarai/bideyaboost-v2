import prisma from '../../database/client';

export class MeetingsRepository {
    static async createBooking(data: {
        studentId: string;
        expertId: string;
        date: Date;
        time?: string;
        notes?: string;
    }) {
        return prisma.meeting.create({
            data: {
                ...data,
                status: 'PENDING',
            },
        });
    }

    static async updateStatus(id: string, status: string) {
        return prisma.meeting.update({
            where: { id },
            data: { status },
        });
    }

    static async findUserMeetings(userId: string, role: 'STUDENT' | 'EXPERT') {
        const where = role === 'STUDENT'
            ? { student: { userId } }
            : { expert: { userId } };

        return prisma.meeting.findMany({
            where,
            include: {
                student: { include: { user: { select: { name: true, email: true } } } },
                expert: { include: { user: { select: { name: true, email: true } } } },
            },
            orderBy: { date: 'asc' },
        });
    }

    static async createVideoMeeting(data: any) {
        return prisma.videoMeeting.create({
            data: {
                ...data,
                participants: {
                    create: data.participantIds?.map((userId: string) => ({ userId })) || [],
                },
            },
        });
    }
}
