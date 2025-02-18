import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { validationSchema } from 'config/app.config';
import databaseTestConfig from 'config/database-test.config';

import { ApiKey } from 'shared/entities/api-key.entity';
import { Transaction } from 'shared/entities/transaction.entity';

import { UsersModule } from 'users/users.module';
import { HttpExceptionFilter } from 'shared/filters/http-exception.filter';
import { RequestTimeoutInterceptor } from 'shared/interceptors/request-timeout.interceptor';
import { GlobalValidationPipe } from 'shared/pipes/global-validation.pipe';

describe('[Feature] UsersModule - /users', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule.forFeature(databaseTestConfig)],
                    inject: [databaseTestConfig.KEY],
                    useFactory: (config: ConfigType<typeof databaseTestConfig>) => ({
                        ...config,
                        type: 'postgres',
                        entities: ['*.entity.ts'],
                        synchronize: true,
                        autoLoadEntities: true,
                    }),
                }),
                // NOTE: Need to correctly parse env variables
                ConfigModule.forRoot({
                    validationSchema,
                }),
                // NOTE: Need to correctly run db service
                TypeOrmModule.forFeature([Transaction, ApiKey]),
                UsersModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new GlobalValidationPipe());
        app.useGlobalFilters(new HttpExceptionFilter());
        app.useGlobalInterceptors(new RequestTimeoutInterceptor());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it.todo('GET /users/:id');
    it.todo('GET /me');
    it.todo('Patch /users');
    it.todo('Patch /users/currency/:id');
    it.todo('Patch /users/role/:id');
    it.todo('DELETE /users/:id');

    describe('GET /users', () => {
        it('return 200 status', () => {
            return request(app.getHttpServer()).get('/users').expect(200);
        });

        it('return 200 status for passed limit and offset', () => {
            return request(app.getHttpServer()).get('/users?limit=10&offset=3').expect(200);
        });

        it('return 400 status for passed invalid limit', () => {
            return request(app.getHttpServer()).get('/users?limit=invalid').expect(400);
        });

        it('return 400 status for passed invalid offset', () => {
            return request(app.getHttpServer()).get('/users?offset=invalid').expect(400);
        });

        it('return list of users', async () => {
            const response = await request(app.getHttpServer()).get('/users?limit=10&offset=1');
            expect(response.body.items).toBeInstanceOf(Array);
        });
    });
});
