import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../shared/entities/user.entity';

import { UsersModule } from '../users/users.module';

import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UsersModule],
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
