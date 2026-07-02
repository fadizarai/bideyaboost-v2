import { ActivitiesRepository } from './activities.repository';

export class ActivitiesService {
    static async log(userId: string, action: string, details?: any) {
        return ActivitiesRepository.logActivity(userId, action, details);
    }

    static async getHistory(userId: string) {
        return ActivitiesRepository.findUserActivities(userId);
    }
}
