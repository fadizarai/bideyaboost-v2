import { MediaRepository } from './media.repository';

export class MediaService {
    static async uploadMedia(userId: string, data: any) {
        return MediaRepository.createMedia(userId, data);
    }

    static async getMyMedia(userId: string) {
        return MediaRepository.findUserMedia(userId);
    }

    static async removeMedia(id: string) {
        return MediaRepository.deleteMedia(id);
    }
}
