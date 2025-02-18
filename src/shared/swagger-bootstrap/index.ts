import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export class SwaggerBootstrap {
    constructor(app: INestApplication) {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('My Budget')
            .setDescription('The My Budget API description')
            .setVersion('1.0')
            .build();
        const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

        SwaggerModule.setup('api', app, swaggerDocument, {
            jsonDocumentUrl: '/api-json',
            customSiteTitle: 'My Budget API',
        });
    }
}
