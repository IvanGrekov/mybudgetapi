import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { LoggingMiddleware } from './middlewares/logging.middleware';

@Module({
    imports: [],
    providers: [],
})
export class SharedModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes('*');
    }
}
