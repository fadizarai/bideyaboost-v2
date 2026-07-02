import { ExpertsRepository } from './experts.repository';

export class ExpertsService {
    static async updateExpertProfile(userId: string, data: any) {
        return ExpertsRepository.updateProfile(userId, data);
    }

    static async getExpertDetails(id: string) {
        return ExpertsRepository.findById(id);
    }

    static async listExperts(filters: any) {
        return ExpertsRepository.findAll(filters);
    }
}
