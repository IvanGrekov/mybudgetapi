import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';

import jwtConfig from '../../../config/jwt.config';
import authenticationConfig from '../../../config/authentication.config';

import { REQUEST_USER_KEY } from '../../iam.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        @Inject(authenticationConfig.KEY)
        private readonly authenticationConfiguration: ConfigType<typeof authenticationConfig>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.header('Authorization');

        const token = this.extractTokenFromHeader(authHeader);

        if (!token) {
            throw new UnauthorizedException();
        }

        if (token === this.authenticationConfiguration.apiKey) {
            return true;
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, this.jwtConfiguration);
            request[REQUEST_USER_KEY] = payload;

            return true;
        } catch (e) {
            console.log('AccessTokenGuard', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(authHeader?: string): string {
        return authHeader?.split(' ').at(1) || '';
    }
}
