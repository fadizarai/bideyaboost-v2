import { PerformanceRepository } from './performance.repository';

export class PerformanceService {
    static async recordTest(studentId: string, data: any) {
        return PerformanceRepository.createTestResult({
            ...data,
            studentId,
        });
    }

    static async getTests(studentId: string) {
        return PerformanceRepository.getStudentTests(studentId);
    }

    static async getProgress(studentId: string) {
        return PerformanceRepository.getStudentProgress(studentId);
    }

    static async updateGoals(studentId: string, goals: any) {
        return PerformanceRepository.updateProgress(studentId, { goals });
    }

    static async logUserAction(userId: string, activityType: string, action: string, metadata?: any) {
        return PerformanceRepository.logActivity(userId, {
            activityType,
            action,
            metadata,
        });
    }
}
