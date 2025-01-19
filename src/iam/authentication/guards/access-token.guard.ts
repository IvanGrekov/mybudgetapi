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

import jwtConfig from 'config/jwt.config';

import log from 'shared/utils/log';

import { REQUEST_USER_KEY } from 'iam/iam.constants';

import { IActiveUser } from 'iam/interfaces/active-user-data.interface';
import { IRefreshTokenPayload } from 'iam/authentication/interfaces/refresh-token-payload.interface';

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
            const payload: IRefreshTokenPayload | IActiveUser = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,
                    issuer: this.jwtConfiguration.issuer,
                },
            );

            if (payload?.['refreshTokenId']) {
                throw new UnauthorizedException('Refresh Token must not be used as a Bearer Token');
            }

            request[REQUEST_USER_KEY] = payload;

            return true;
        } catch (e) {
            log('Access Token Verifying Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, key] = request.header('Authorization')?.split(' ') || [];

        return type?.toLowerCase() === 'bearer' ? key : undefined;
    }
}
