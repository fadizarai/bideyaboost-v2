import { AdminsRepository } from './admins.repository';
import { AppError } from '../../shared/errors/AppError';

export class AdminsService {
    static async createNote(adminId: string, data: any) {
        return AdminsRepository.addNote(adminId, data);
    }

    static async getAdminNotes(adminId: string) {
        return AdminsRepository.getNotes(adminId);
    }

    static async configureNavigation(data: any) {
        return AdminsRepository.updateNavConfig(data);
    }

    static async listAllUsers(filters: any) {
        return AdminsRepository.findUsers(filters);
    }
}
