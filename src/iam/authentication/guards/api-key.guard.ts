import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { ApiKey } from 'shared/entities/api-key.entity';
import NotFoundException from 'shared/exceptions/not-found.exception';
import log from 'shared/utils/log';

import { REQUEST_USER_KEY } from 'iam/iam.constants';
import { IActiveUser } from 'iam/interfaces/active-user-data.interface';

import { ApiKeysService } from 'iam/authentication/services/api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly apiKeysService: ApiKeysService,
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        const apiKeyId = this.apiKeysService.extractIdFromApiKey(token);

        try {
            const apiKeyEntity = await this.apiKeyRepository.findOne({
                where: { uuid: apiKeyId },
                relations: { user: true },
            });

            if (!apiKeyEntity) {
                throw new NotFoundException('API Key');
            }

            const { key, user } = apiKeyEntity;

            const isValid = await this.apiKeysService.validate(token, key);
            if (!isValid) {
                throw new UnauthorizedException('API Key is not valid');
            }

            const { id: userId, email, role } = user;
            const payload: IActiveUser = {
                sub: userId,
                email,
                role,
            };
            request[REQUEST_USER_KEY] = payload;
        } catch (e) {
            log('API Key Verifying Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, key] = request.header('Authorization')?.split(' ') || [];

        return type?.toLowerCase() === 'apikey' ? key : undefined;
    }
}
