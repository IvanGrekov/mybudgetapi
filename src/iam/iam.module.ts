import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { User } from '../shared/entities/user.entity';
import { ApiKey } from '../shared/entities/api-key.entity';

import { UsersModule } from '../users/users.module';
import jwtConfig from '../config/jwt.config';
import redisConfig from '../config/redis.config';
import googleAuthenticationConfig from '../config/google-authentication.config';

import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

import { AuthenticationController } from './authentication/controllers/authentication.controller';
import { ApiKeysController } from './authentication/controllers/api-keys.controller';
import { AuthenticationService } from './authentication/services/authentication.service';
import { ApiKeysService } from './authentication/services/api-keys.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { RefreshTokedIdsStorage } from './authentication/storages/refresh-toked-ids.storage';
import { GoogleAuthenticationService } from './authentication/services/google-authentication.service';
import { UserRoleGuard } from './authorization/guards/user-role.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, ApiKey]),
        UsersModule,
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(redisConfig),
        ConfigModule.forFeature(googleAuthenticationConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
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
        AccessTokenGuard,
        ApiKeysService,
        ApiKeyGuard,
        AuthenticationService,
        GoogleAuthenticationService,
        RefreshTokedIdsStorage,
    ],
    controllers: [AuthenticationController, ApiKeysController],
})
export class IamModule {}
