import {
    Injectable,
    Inject,
    UnauthorizedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { User } from '../../../shared/entities/user.entity';
import NotFoundException from '../../../shared/exceptions/not-found.exception';

import { UsersService } from '../../../users/users.service';
import jwtConfig from '../../../config/jwt.config';

import { IActiveUser } from '../../interfaces/active-user-data.interface';

import { SignTokenDto } from '../dtos/sign-token.dto';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { TokedIdsStorage } from '../storages/toked-ids.storage';
import { IRefreshTokenPayload } from '../interfaces/refresh-token-payload.interface';
import InvalidatedToken from '../exceptions/invalidated-token.exception';

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

    async generateTokens({ id, email, role }: User): Promise<GeneratedTokensDto> {
        try {
            const payload: IActiveUser = {
                sub: id,
                email,
                role,
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

            await this.tokenIdsStorage.insert(id, refreshTokenId);

            return { accessToken, refreshToken };
        } catch (e) {
            console.log('Tokens Signing Failed', JSON.stringify(e, null, 2));
            throw new InternalServerErrorException();
        }
    }

    async refreshToken({ refreshToken }: RefreshTokenDto): Promise<GeneratedTokensDto> {
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
            await this.tokenIdsStorage.validate(userId, refreshTokenId);

            return this.generateTokens(user);
        } catch (e) {
            if (e instanceof InvalidatedToken) {
                console.log('Refresh Token Is Invalid');
                throw new UnauthorizedException('Access Denied');
            }

            console.log('Refresh Token Verifying Failed', JSON.stringify(e, null, 2));

            throw new UnauthorizedException();
        }
    }
}
