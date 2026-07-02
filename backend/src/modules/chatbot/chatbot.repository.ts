import prisma from '../../database/client';

export class ChatbotRepository {
    static async createHistory(userId?: string, studentId?: string) {
        return prisma.chatbotHistory.create({
            data: {
                userId,
                studentId,
            },
        });
    }

    static async addMessage(historyId: string, sender: string, text: string) {
        return prisma.chatbotMessage.create({
            data: {
                chatbotHistoryId: historyId,
                sender,
                text,
            },
        });
    }

    static async getHistory(userId: string) {
        return prisma.chatbotHistory.findMany({
            where: {
                OR: [
                    { userId },
                    { student: { userId } }
                ]
            },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
