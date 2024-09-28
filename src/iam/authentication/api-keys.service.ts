import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { ApiKey } from '../../shared/entities/api-key.entity';

import { UsersService } from '../../users/users.service';

import { HashingService } from '../hashing/hashing.service';
import { GetApiKeyByUserIdDto } from './dtos/get-api-key-by-user-id.dto';
import { CreateApiKeyForUserDto } from './dtos/create-api-key-for-user.dto';
import { GeneratedApiKeyDto } from './dtos/generated-api-key-payload.dto';

@Injectable()
export class ApiKeysService {
    constructor(
        private readonly usersService: UsersService,
        private readonly hashingService: HashingService,
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
    ) {}

    private encodingFormat: BufferEncoding = 'base64';
    private decodingFormat: BufferEncoding = 'ascii';

    async createForUser({ userId }: CreateApiKeyForUserDto): Promise<GeneratedApiKeyDto> {
        const user = await this.usersService.getOne(userId);
        const uuid = randomUUID();
        const apiKeyDto = await this.createAndHash(uuid);

        await this.apiKeyRepository.save({
            user,
            uuid,
            // NOTE: In a real-world application, we should not store the API key
            apiKey: apiKeyDto.apiKey,
            key: apiKeyDto.hashedKey,
        });

        return apiKeyDto;
    }

    async getByUserId({ userId }: GetApiKeyByUserIdDto): Promise<ApiKey[]> {
        return this.apiKeyRepository.find({ where: { user: { id: userId } } });
    }

    async createAndHash(id: number | string): Promise<GeneratedApiKeyDto> {
        const apiKey = this.generateApiKey(id);
        const hashedKey = await this.hashingService.hash(apiKey);

        return { apiKey, hashedKey };
    }

    async validate(apiKey: string, hashedKey: string): Promise<boolean> {
        return this.hashingService.compare(apiKey, hashedKey);
    }

    extractIdFromApiKey(apiKey: string): string {
        const [id] = Buffer.from(apiKey, this.encodingFormat)
            .toString(this.decodingFormat)
            .split(' ');

        return id;
    }

    private generateApiKey(id: number | string): string {
        const apiKey = `${id} ${randomUUID()}`;

        return Buffer.from(apiKey).toString(this.encodingFormat);
    }
}
