import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';

import { User } from '../shared/entities/user.entity';
import { ApiKey } from '../shared/entities/api-key.entity';

import { UsersModule } from '../users/users.module';
import jwtConfig from '../config/jwt.config';
import redisConfig from '../config/redis.config';
import googleAuthenticationConfig from '../config/google-authentication.config';
import tfaAuthenticationConfig from '../config/tfa-authentication.config';
import emailConfig from '../config/email.config';

import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

import { AuthenticationController } from './authentication/controllers/authentication.controller';
import { ApiKeysController } from './authentication/controllers/api-keys.controller';
import { TokensService } from './authentication/services/tokens.service';
import { AuthenticationService } from './authentication/services/authentication.service';
import { ResetPasswordService } from './authentication/services/reset-password.service';
import { ApiKeysService } from './authentication/services/api-keys.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { TokedIdsStorage } from './authentication/storages/toked-ids.storage';
import { GoogleAuthenticationService } from './authentication/services/google-authentication.service';
import { TfaAuthenticationService } from './authentication/services/tfa-authentication.service';
import { UserRoleGuard } from './authorization/guards/user-role.guard';
import { OnlyMeGuard } from './authorization/guards/only-me.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, ApiKey]),
        UsersModule,
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(redisConfig),
        ConfigModule.forFeature(googleAuthenticationConfig),
        ConfigModule.forFeature(tfaAuthenticationConfig),
        ConfigModule.forFeature(emailConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        MailerModule.forRootAsync({
            imports: [ConfigModule.forFeature(emailConfig)],
            inject: [emailConfig.KEY],
            useFactory: ({ host, port, user, pass }: ConfigType<typeof emailConfig>) => ({
                transport: {
                    host,
                    port,
                    auth: {
                        user,
                        pass,
                    },
                },
            }),
        }),
    ],
    providers: [
        {
            provide: HashingService,
            useClass: BcryptService,
        },
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard,
        },
        {
            provide: APP_GUARD,
            useClass: UserRoleGuard,
        },
        {
            provide: APP_GUARD,
            useClass: OnlyMeGuard,
        },
        AccessTokenGuard,
        ApiKeysService,
        ApiKeyGuard,
        TokensService,
        AuthenticationService,
        ResetPasswordService,
        GoogleAuthenticationService,
        TfaAuthenticationService,
        TokedIdsStorage,
    ],
    controllers: [AuthenticationController, ApiKeysController],
})
export class IamModule {}
