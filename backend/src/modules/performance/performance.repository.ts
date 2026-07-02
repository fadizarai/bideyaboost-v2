import prisma from '../../database/client';

export class PerformanceRepository {
    // Test Results
    static async createTestResult(data: any) {
        return prisma.testResult.create({
            data,
        });
    }

    static async getStudentTests(studentId: string) {
        return prisma.testResult.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Progress
    static async getStudentProgress(studentId: string) {
        return prisma.studentProgress.findUnique({
            where: { studentId },
        });
    }

    static async updateProgress(studentId: string, data: any) {
        return prisma.studentProgress.upsert({
            where: { studentId },
            update: data,
            create: {
                studentId,
                ...data,
            },
        });
    }

    // Activity Tracking
    static async logActivity(userId: string, data: any) {
        return prisma.userActivity.create({
            data: {
                userId,
                ...data,
            },
        });
    }
}
