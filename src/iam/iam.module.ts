import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { User } from '../shared/entities/user.entity';

import { UsersModule } from '../users/users.module';
import jwtConfig from '../config/jwt.config';
import authenticationConfig from '../config/authentication.config';

import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        UsersModule,
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(authenticationConfig),
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
        AccessTokenGuard,
        AuthenticationService,
    ],
    controllers: [AuthenticationController],
})
export class IamModule {}
