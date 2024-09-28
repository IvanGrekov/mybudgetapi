import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { HashingService } from '../hashing/hashing.service';

import { GeneratedApiKeyPayload } from './interfaces/generated-api-key-payload.interface';

@Injectable()
export class ApiKeysService {
    constructor(private readonly hashingService: HashingService) {}

    private encodingFormat: BufferEncoding = 'base64';
    private decodingFormat: BufferEncoding = 'ascii';

    async createAndHash(id: number): Promise<GeneratedApiKeyPayload> {
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

    private generateApiKey(id: number): string {
        const apiKey = `${id} ${randomUUID()}`;

        return Buffer.from(apiKey).toString(this.encodingFormat);
    }
}
