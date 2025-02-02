import {
    Injectable,
    Inject,
    ForbiddenException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import jwtConfig from 'config/jwt.config';
import emailConfig from 'config/email.config';

import { User } from 'shared/entities/user.entity';
import NotFoundException from 'shared/exceptions/not-found.exception';
import log from 'shared/utils/log';

import { UsersService } from 'users/users.service';

import { HashingService } from 'iam/hashing/hashing.service';

import { TokensService } from 'iam/authentication/services/tokens.service';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';
import { ResetPasswordDto } from 'iam/authentication/dtos/reset-password.dto';
import { TokedIdsStorage } from 'iam/authentication/storages/toked-ids.storage';
import InvalidatedToken from 'iam/authentication/exceptions/invalidated-token.exception';
import { RESET_PASSWORD_TOKEN_STORE_PREFIX } from 'iam/authentication/constants/reset-password-token-store-prefix';

@Injectable()
export class ResetPasswordService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        @Inject(emailConfig.KEY)
        private readonly emailConfiguration: ConfigType<typeof emailConfig>,
        private readonly tokenIdsStorage: TokedIdsStorage,
        private readonly tokensService: TokensService,
        private readonly mailService: MailerService,
    ) {}
    async initiateResetPassword(email: User['email']): Promise<void> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User', email);
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const resetPasswordToken = await this.tokensService.signToken({
            payload: { sub: verificationCode },
            expiresIn: this.jwtConfiguration.resetPasswordTokenExpiresIn,
        });

        await this.mailService
            .sendMail({
                from: `My Budget App <noreply@${this.emailConfiguration.senderDomain}>`,
                to: email,
                subject: 'Verify your email to reset password',
                html: `<h1>Verification Code:</h1><h2>${verificationCode}</h2>`,
            })
            .catch((e) => {
                log('Failed to send mail', JSON.stringify(e, null, 2));
                throw new ServiceUnavailableException();
            });

        return this.tokenIdsStorage.insert({
            userId: user.id,
            tokenId: resetPasswordToken,
            keyPrefix: RESET_PASSWORD_TOKEN_STORE_PREFIX,
            expiresIn: this.jwtConfiguration.resetPasswordTokenExpiresIn,
        });
    }

    async resetPassword({
        email,
        newPassword,
        verificationCode,
        deviceId,
    }: ResetPasswordDto): Promise<GeneratedTokensDto> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User', email);
        }

        try {
            const { id: userId, email, role } = user;

            const storedResetPasswordToken = await this.tokenIdsStorage.get(
                userId,
                RESET_PASSWORD_TOKEN_STORE_PREFIX,
            );
            const { sub } = await this.jwtService.verifyAsync(storedResetPasswordToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });

            if (verificationCode !== sub) {
                throw new InvalidatedToken();
            }

            const newHashedPassword = await this.hashingService.hash(newPassword);

            await this.userRepository.update(
                {
                    id: userId,
                },
                {
                    password: newHashedPassword,
                },
            );

            await this.tokenIdsStorage.invalidateUserKeys(userId);

            return this.tokensService.generateTokens({
                id: userId,
                email,
                role,
                deviceId,
            });
        } catch (e) {
            log('Reset Password Failed', JSON.stringify(e, null, 2));
            if (e instanceof InvalidatedToken) {
                throw new ForbiddenException('Verification Code Is Invalid');
            }

            throw new ForbiddenException();
        }
    }
}
