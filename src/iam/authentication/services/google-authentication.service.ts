import {
    Injectable,
    OnModuleInit,
    Inject,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import googleAuthenticationConfig from 'config/google-authentication.config';

import { User } from 'shared/entities/user.entity';
import log from 'shared/utils/log';

import { UsersService } from 'users/users.service';

import { GoogleSignInDto } from 'iam/authentication/dtos/google-sign-in.dto';
import { TokensService } from 'iam/authentication/services/tokens.service';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
    private oauthClient: OAuth2Client;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(googleAuthenticationConfig.KEY)
        private readonly googleAuthenticationConfiguration: ConfigType<
            typeof googleAuthenticationConfig
        >,
        private readonly tokensService: TokensService,
        private readonly usersService: UsersService,
    ) {}

    onModuleInit(): void {
        const clientId = this.googleAuthenticationConfiguration.clientId;
        const clientSecret = this.googleAuthenticationConfiguration.clientSecret;
        this.oauthClient = new OAuth2Client(clientId, clientSecret);
    }

    async authenticate({ token: idToken, deviceId }: GoogleSignInDto): Promise<GeneratedTokensDto> {
        try {
            const ticket = await this.oauthClient.verifyIdToken({
                idToken,
            });
            const { email, sub: googleId } = ticket.getPayload();
            let user = await this.userRepository.findOne({ where: { googleId } });

            if (!user) {
                user = await this.usersService.create({
                    googleId,
                    email,
                });
            }

            return this.tokensService.generateTokens({ ...user, deviceId });
        } catch (e) {
            if (e?.['code'] === '23505') {
                throw new ConflictException('User with this email already exists');
            }
            log('Google Authentication Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }
}
