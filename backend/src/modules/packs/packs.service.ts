import { PacksRepository } from './packs.repository';

export class PacksService {
    static async create(data: any) {
        return PacksRepository.createPack(data);
    }

    static async getPacks(filters: any) {
        return PacksRepository.findAllPacks(filters);
    }

    static async buyPack(userId: string, packId: string) {
        return PacksRepository.purchasePack(userId, packId);
    }
}
