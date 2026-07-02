import { ClubsRepository } from './clubs.repository';

export class ClubsService {
    static async createClub(userId: string, data: any) {
        return ClubsRepository.create({
            ...data,
            userId,
        });
    }

    static async listClubs(filters: any) {
        return ClubsRepository.findAll(filters);
    }

    static async getClub(id: string) {
        return ClubsRepository.findById(id);
    }
}
