import { ContactRepository } from './contact.repository';

export class ContactService {
    static async submitContactForm(data: any) {
        return ContactRepository.createSubmission(data);
    }

    static async getAllSubmissions() {
        return ContactRepository.findAll();
    }
}
