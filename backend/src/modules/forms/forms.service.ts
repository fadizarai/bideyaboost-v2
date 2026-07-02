import { FormsRepository } from './forms.repository';

export class FormsService {
    static async create(creatorId: string, data: any) {
        return FormsRepository.createForm(creatorId, data);
    }

    static async registerResponse(formId: string, studentId: string, responseData: any) {
        return FormsRepository.submitResponse({
            formId,
            studentId,
            responseData,
        });
    }

    static async listForms(filters: any) {
        return FormsRepository.findForms(filters);
    }

    static async getResponses(formId: string) {
        return FormsRepository.getFormResponses(formId);
    }
}
