import { ChatbotRepository } from './chatbot.repository';

export class ChatbotService {
    static async getOrCreateHistory(userId: string, studentId?: string) {
        const existing = await ChatbotRepository.getHistory(userId);
        if (existing.length > 0) return existing[0];

        return ChatbotRepository.createHistory(userId, studentId);
    }

    static async saveMessage(historyId: string, sender: string, text: string) {
        return ChatbotRepository.addMessage(historyId, sender, text);
    }

    static async getUserHistory(userId: string) {
        return ChatbotRepository.getHistory(userId);
    }
}
