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

import { REQUEST_USER_KEY } from '../../iam.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            request[REQUEST_USER_KEY] = payload;

            return true;
        } catch (e) {
            console.log('Access Token Verifying Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, key] = request.header('Authorization')?.split(' ') || [];

        return type?.toLowerCase() === 'bearer' ? key : undefined;
    }
}
