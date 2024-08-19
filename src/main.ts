import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { HttpExceptionFilter } from './shared/filters/http-exception-filter.filter';
import { RequestTimeoutInterceptor } from './shared/interceptors/request-timeout.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalInterceptors(new RequestTimeoutInterceptor());

    const config = new DocumentBuilder()
        .setTitle('My Budget')
        .setDescription('The My Budget API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        jsonDocumentUrl: '/api-json',
        customSiteTitle: 'My Budget API',
    });

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
