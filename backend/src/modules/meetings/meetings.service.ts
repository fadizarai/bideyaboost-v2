import { MeetingsRepository } from './meetings.repository';

export class MeetingsService {
    static async bookMeeting(studentId: string, data: any) {
        return MeetingsRepository.createBooking({
            ...data,
            studentId,
        });
    }

    static async updateStatus(id: string, status: string) {
        return MeetingsRepository.updateStatus(id, status);
    }

    static async getMyMeetings(userId: string, role: 'STUDENT' | 'EXPERT') {
        return MeetingsRepository.findUserMeetings(userId, role);
    }

    static async scheduleVideoMeeting(creatorId: string, data: any) {
        return MeetingsRepository.createVideoMeeting({
            ...data,
            creatorId,
        });
    }
}
