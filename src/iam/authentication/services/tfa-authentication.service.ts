import { Injectable, Inject, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';

import { User } from '../../../shared/entities/user.entity';
import NotFoundException from '../../../shared/exceptions/not-found.exception';

import tfaAuthenticationConfig from '../../../config/tfa-authentication.config';
import { UsersService } from '../../../users/users.service';

import { IGeneratedTfaSecretPayload } from '../interfaces/generated-tfa-secret-payload.interface';
import { IVerifyTfaTokenInput } from '../interfaces/verify-tfa-token-input.interface';
import { InitiateTfaEnablingDto } from '../dtos/initiate-tfa-enabling.dto';
import { DisableTfaDto } from '../dtos/disable-tfa.dto';

@Injectable()
export class TfaAuthenticationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly usersService: UsersService,
        @Inject(tfaAuthenticationConfig.KEY)
        private readonly tfaAuthenticationConfiguration: ConfigType<typeof tfaAuthenticationConfig>,
    ) {}

    generateSecret(userEmail: string): IGeneratedTfaSecretPayload {
        const issuer = this.tfaAuthenticationConfiguration.tfaAppName;
        const secret = authenticator.generateSecret();
        const uri = authenticator.keyuri(userEmail, issuer, secret);

        return {
            uri,
            secret,
        };
    }

    verifyToken(input: IVerifyTfaTokenInput): boolean {
        return authenticator.verify(input);
    }

    async initiateTfaEnabling({ email, tfaSecret }: InitiateTfaEnablingDto): Promise<void> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User');
        }

        await this.userRepository.update(
            {
                id: user.id,
            },
            {
                // NOTE: Ideally, we should store the secret in a more secure way (e.g. encrypted)
                tfaSecret,
            },
        );
    }

    async enableTfaForUser(email: string): Promise<void> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User');
        }

        if (!user.tfaSecret) {
            throw new ForbiddenException();
        }

        await this.userRepository.update(
            {
                id: user.id,
            },
            {
                isTfaEnabled: true,
            },
        );
    }

    async disableTfaForUser({ email, tfaToken }: DisableTfaDto): Promise<void> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User');
        }

        if (!user.isTfaEnabled) {
            throw new ForbiddenException();
        }

        if (!this.verifyToken({ token: tfaToken, secret: user.tfaSecret })) {
            throw new UnauthorizedException();
        }

        await this.userRepository.update(
            {
                id: user.id,
            },
            {
                isTfaEnabled: false,
                tfaSecret: null,
            },
        );
    }
}
