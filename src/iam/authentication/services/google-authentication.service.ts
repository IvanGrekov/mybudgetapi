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

import { User } from '../../../shared/entities/user.entity';

import googleAuthenticationConfig from '../../../config/google-authentication.config';

import { UsersService } from '../../../users/users.service';

import { AuthenticationService } from './authentication.service';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';

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
        private readonly authenticationService: AuthenticationService,
        private readonly usersService: UsersService,
    ) {}

    onModuleInit(): void {
        const clientId = this.googleAuthenticationConfiguration.clientId;
        const clientSecret = this.googleAuthenticationConfiguration.clientSecret;
        this.oauthClient = new OAuth2Client(clientId, clientSecret);
    }

    async authenticate(idToken: string): Promise<GeneratedTokensDto> {
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

            return this.authenticationService.generateTokens(user);
        } catch (e) {
            if (e?.['code'] === '23505') {
                throw new ConflictException('User with this email already exists');
            }
            console.log('Google Authentication Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }
}
