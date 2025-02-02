import {
    Injectable,
    Inject,
    UnauthorizedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';

import jwtConfig from 'config/jwt.config';

import { User } from 'shared/entities/user.entity';
import NotFoundException from 'shared/exceptions/not-found.exception';
import log from 'shared/utils/log';

import { UsersService } from 'users/users.service';

import { IActiveUser } from 'iam/interfaces/active-user-data.interface';

import { SignTokenDto } from 'iam/authentication/dtos/sign-token.dto';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';
import { RefreshTokenDto } from 'iam/authentication/dtos/refresh-token.dto';
import { TokedIdsStorage } from 'iam/authentication/storages/toked-ids.storage';
import { IRefreshTokenPayload } from 'iam/authentication/interfaces/refresh-token-payload.interface';
import InvalidatedToken from 'iam/authentication/exceptions/invalidated-token.exception';
import { REFRESH_TOKEN_ID_STORE_PREFIX } from 'iam/authentication/constants/refresh-token-id-store-prefix';

@Injectable()
export class TokensService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly tokenIdsStorage: TokedIdsStorage,
    ) {}

    async signToken<T extends { sub: number }>({
        payload,
        expiresIn,
    }: SignTokenDto<T>): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.jwtConfiguration.secret,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
            expiresIn,
        });
    }

    async generateTokens({
        id,
        email,
        role,
        deviceId,
    }: Pick<User, 'id' | 'email' | 'role'> & {
        deviceId: string;
    }): Promise<GeneratedTokensDto> {
        try {
            const payload: IActiveUser = {
                sub: id,
                email,
                role,
                deviceId,
            };
            const refreshTokenId = randomUUID();

            const [accessToken, refreshToken] = await Promise.all([
                this.signToken<IActiveUser>({
                    payload,
                    expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
                }),
                this.signToken<IRefreshTokenPayload>({
                    payload: { ...payload, refreshTokenId },
                    expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
                }),
            ]);

            await this.tokenIdsStorage.insert({
                userId: id,
                tokenId: refreshTokenId,
                keyPrefix: this.getRefreshTokenIdKeyPrefix(deviceId),
                expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
            });

            return { accessToken, refreshToken };
        } catch (e) {
            log('Tokens Signing Failed', JSON.stringify(e, null, 2));
            throw new InternalServerErrorException();
        }
    }

    async refreshToken({ refreshToken, deviceId }: RefreshTokenDto): Promise<GeneratedTokensDto> {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<IRefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,
                    issuer: this.jwtConfiguration.issuer,
                },
            );

            const user = await this.usersService.getOne(sub);
            if (!user) {
                throw new NotFoundException('User');
            }

            const userId = user.id;
            await this.tokenIdsStorage.validate({
                userId,
                keyPrefix: this.getRefreshTokenIdKeyPrefix(deviceId),
                tokenId: refreshTokenId,
            });

            return this.generateTokens({ ...user, deviceId });
        } catch (e) {
            if (e instanceof InvalidatedToken) {
                log('Refresh Token Is Invalid');
                throw new UnauthorizedException('Access Denied');
            }

            log('Refresh Token Verifying Failed', JSON.stringify(e, null, 2));

            throw new UnauthorizedException();
        }
    }

    private getRefreshTokenIdKeyPrefix(deviceId: string): string {
        return `${REFRESH_TOKEN_ID_STORE_PREFIX}-${deviceId}`;
    }
}
