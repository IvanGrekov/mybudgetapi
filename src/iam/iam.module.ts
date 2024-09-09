import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { User } from '../shared/entities/user.entity';

import { UsersModule } from '../users/users.module';
import jwtConfig from '../config/jwt.config';

import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        UsersModule,
        ConfigModule.forFeature(jwtConfig),
        JwtModule.registerAsync(jwtConfig.asProvider()),
    ],
    providers: [
        {
            provide: HashingService,
            useClass: BcryptService,
        },
        AuthenticationService,
    ],
    controllers: [AuthenticationController],
})
export class IamModule {}
