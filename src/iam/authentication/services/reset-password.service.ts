import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '../../../shared/entities/user.entity';
import NotFoundException from '../../../shared/exceptions/not-found.exception';

import { UsersService } from '../../../users/users.service';
import jwtConfig from '../../../config/jwt.config';

import { HashingService } from '../../hashing/hashing.service';

import { TokensService } from './tokens.service';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { TokedIdsStorage } from '../storages/toked-ids.storage';
import InvalidatedToken from '../exceptions/invalidated-token.exception';
import { RESET_PASSWORD_TOKEN_STORE_PREFIX } from '../constants/reset-password-token-store-prefix';

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

        await this.mailService.sendMail({
            from: 'My Budget App <noreply@gmail.com>',
            to: email,
            subject: 'Verify your email to reset password',
            html: `<h1>Verification Code:</h1><h2>${verificationCode}</h2>`,
        });

        return this.tokenIdsStorage.insert(
            user.id,
            resetPasswordToken,
            RESET_PASSWORD_TOKEN_STORE_PREFIX,
        );
    }

    async resetPassword({
        email,
        newPassword,
        verificationCode,
    }: ResetPasswordDto): Promise<GeneratedTokensDto> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User', email);
        }

        try {
            const userId = user.id;
            const storedToken = await this.tokenIdsStorage.get(
                userId,
                RESET_PASSWORD_TOKEN_STORE_PREFIX,
            );
            const { sub } = await this.jwtService.verifyAsync(storedToken, {
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

            await this.tokenIdsStorage.invalidate(userId, RESET_PASSWORD_TOKEN_STORE_PREFIX);

            return this.tokensService.generateTokens(user);
        } catch (e) {
            console.log('Reset Password Failed', JSON.stringify(e, null, 2));
            if (e instanceof InvalidatedToken) {
                throw new ForbiddenException('Verification Code Is Invalid');
            }

            throw new ForbiddenException();
        }
    }
}
