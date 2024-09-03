import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import authenticationConfig from '../config/authentication.config';
import { ApiKeyGuard } from './guards/api-key-guard.guard';
import { LoggingMiddleware } from './middlewares/logging.middleware';
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
export class SharedModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes('*');
    }
}
