import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { validationSchema } from 'config/app.config';
import databaseTestConfig from 'config/database-test.config';

import { HttpExceptionFilter } from 'shared/filters/http-exception.filter';
import { RequestTimeoutInterceptor } from 'shared/interceptors/request-timeout.interceptor';
import { GlobalValidationPipe } from 'shared/pipes/global-validation.pipe';
import { Transaction } from 'shared/entities/transaction.entity';

import { IamModule } from 'iam/iam.module';

import { UsersModule } from 'users/users.module';

import { SIGN_UP_DTO } from './users.e2e.constants';

describe('[Feature] UsersModule - /users', () => {
    let app: INestApplication;
    let accessToken: string;

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
                TypeOrmModule.forFeature([Transaction]),
                IamModule,
                UsersModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new GlobalValidationPipe());
        app.useGlobalFilters(new HttpExceptionFilter());
        app.useGlobalInterceptors(new RequestTimeoutInterceptor());

        await app.init();

        // NOTE: Create user for testing
        await request(app.getHttpServer())
            .post('/authentication/sign-up')
            .send(SIGN_UP_DTO)
            .then(({ body }) => {
                accessToken = body.accessToken;
            });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /users', () => {
        it('return FORBIDDEN status if regular user tries to get list of users', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.FORBIDDEN);
        });
    });

    describe('GET /users/me', () => {
        it('return my user', () => {
            return request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.OK)
                .then(({ body }) => {
                    expect(body.email).toBe(SIGN_UP_DTO.email);
                });
        });

        it('return UNAUTHORIZED status if no token is provided', () => {
            return request(app.getHttpServer()).get('/users/me').expect(HttpStatus.UNAUTHORIZED);
        });

        it('return UNAUTHORIZED status if invalid token is provided', () => {
            return request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer invalid`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('GET /users/:id', () => {
        it('return FORBIDDEN status if regular user tries to get user by id', () => {
            return request(app.getHttpServer())
                .get('/users/10')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.FORBIDDEN);
        });

        it('return my user', () => {
            return request(app.getHttpServer())
                .get('/users/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.OK)
                .then(({ body }) => {
                    expect(body.email).toBe(SIGN_UP_DTO.email);
                });
        });
    });

    describe('PATCH /users/:id', () => {
        it('able to edit my user', () => {
            const newNickname = 'John Doe';

            return request(app.getHttpServer())
                .patch('/users/1')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    nickname: newNickname,
                })
                .expect(HttpStatus.OK)
                .then(({ body }) => {
                    expect(body.nickname).toBe(newNickname);
                });
        });
    });
});
