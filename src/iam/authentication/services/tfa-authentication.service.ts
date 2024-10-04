import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { authenticator } from 'otplib';

import { User } from '../../../shared/entities/user.entity';
import NotFoundException from '../../../shared/exceptions/not-found.exception';

import tfaAuthenticationConfig from '../../../config/tfa-authentication.config';

import { IGeneratedTfaSecretPayload } from '../interfaces/generated-tfa-secret-payload.interface';
import { IVerifyTfaTokenInput } from '../interfaces/verify-tfa-token-input.interface';
import { EnableTfaForUserDto } from '../dtos/enable-tfa-for-user.dto';

@Injectable()
export class TfaAuthenticationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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

    async enableTfaForUser({ email, tfaSecret }: EnableTfaForUserDto): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User');
        }

        await this.userRepository.update(
            {
                id: user.id,
            },
            {
                isTfaEnabled: true,
                // NOTE: Ideally, we should store the secret in a more secure way (e.g. encrypted)
                tfaSecret,
            },
        );
    }
}
