import prisma from '../../database/client';

export class MessagingRepository {
    static async createConversation(data: {
        type: string;
        name?: string;
        description?: string;
        avatar?: string;
        participantIds: string[];
        creatorId?: string;
    }) {
        const { participantIds, ...convData } = data;
        return prisma.conversation.create({
            data: {
                ...convData,
                participants: {
                    create: participantIds.map((id) => ({
                        userId: id,
                        role: id === data.creatorId ? 'OWNER' : 'MEMBER'
                    })),
                },
            },
            include: {
                participants: true,
            },
        });
    }

    static async findUserConversations(userId: string) {
        return prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            orderBy: { lastActivity: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
    }

    static async createMessage(data: {
        conversationId: string;
        senderId: string;
        content?: string;
        type: string;
        attachments?: any;
        replyToId?: string;
    }) {
        return prisma.$transaction(async (tx: { message: { create: (arg0: { data: { conversationId: string; senderId: string; content?: string; type: string; attachments?: any; replyToId?: string; }; }) => any; }; conversation: { update: (arg0: { where: { id: string; }; data: { lastActivity: Date; lastMessage: string | undefined; }; }) => any; }; }) => {
            const message = await tx.message.create({
                data: {
                    ...data,
                },
            });

            // Update conversation last activity
            await tx.conversation.update({
                where: { id: data.conversationId },
                data: {
                    lastActivity: new Date(),
                    lastMessage: data.content?.substring(0, 100),
                },
            });

            return message;
        });
    }

    static async getMessages(conversationId: string, skip: number, take: number) {
        return prisma.message.findMany({
            where: { conversationId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                sender: {
                    select: { id: true, name: true },
                },
                replyTo: {
                    select: { id: true, content: true, senderId: true }
                }
            },
        });
    }

    static async markAsRead(conversationId: string, userId: string) {
        return prisma.conversationParticipant.update({
            where: {
                conversationId_userId: { conversationId, userId }
            },
            data: {
                lastSeenTime: new Date()
            }
        });
    }
}
