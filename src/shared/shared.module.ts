import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import authenticationConfig from '../config/authentication.config';
import { ApiKeyGuard } from './guards/api-key-guard.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [ConfigModule.forFeature(authenticationConfig)],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ApiKeyGuard,
        },
    ],
})
export class SharedModule {}
