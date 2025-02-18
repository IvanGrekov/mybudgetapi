import { NestFactory } from '@nestjs/core';

import { HttpExceptionFilter } from 'shared/filters/http-exception.filter';
import { RequestTimeoutInterceptor } from 'shared/interceptors/request-timeout.interceptor';
import { AppModule } from 'app.module';
import { GlobalValidationPipe } from 'shared/pipes/global-validation.pipe';
import { SwaggerBootstrap } from 'shared/swagger-bootstrap';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.useGlobalPipes(new GlobalValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new RequestTimeoutInterceptor());

    new SwaggerBootstrap(app);

    await app.listen(process.env.PORT || 8000);
}
bootstrap();
