import { MessagingRepository } from './messaging.repository';

export class MessagingService {
    static async startConversation(data: {
        senderId: string;
        participantIds: string[];
        type?: string;
        name?: string;
        description?: string;
        avatar?: string;
    }) {
        const allParticipants = Array.from(new Set([...data.participantIds, data.senderId]));
        const type = data.type || (allParticipants.length > 2 ? 'GROUP' : 'PRIVATE');

        return MessagingRepository.createConversation({
            ...data,
            type,
            participantIds: allParticipants,
            creatorId: data.senderId
        });
    }

    static async getUserConversations(userId: string) {
        return MessagingRepository.findUserConversations(userId);
    }

    static async sendMessage(data: {
        conversationId: string;
        senderId: string;
        content?: string;
        type: string;
        attachments?: any;
        replyToId?: string;
    }) {
        return MessagingRepository.createMessage(data);
    }

    static async getConversationMessages(conversationId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;
        return MessagingRepository.getMessages(conversationId, skip, limit);
    }

    static async markSeen(conversationId: string, userId: string) {
        return MessagingRepository.markAsRead(conversationId, userId);
    }
}
