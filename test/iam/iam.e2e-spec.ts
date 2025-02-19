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
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { Transaction } from 'shared/entities/transaction.entity';

import { IamModule } from 'iam/iam.module';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';

import {
    SIGN_UP_DTO,
    SIGN_IN_DTO,
    GENERATED_TOKENS_DTO,
    UNAUTHORIZED_ERROR_RESPONSE,
    CONFLICT_ERROR_RESPONSE,
} from './iam.e2e.constants';

describe('[Feature] IamModule - /authentication', () => {
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
                TypeOrmModule.forFeature([Account, TransactionCategory, Transaction]),
                IamModule,
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

    describe('POST /authentication/sign-up', () => {
        it('return generated tokens', () => {
            return request(app.getHttpServer())
                .post('/authentication/sign-up')
                .send(SIGN_UP_DTO)
                .expect(HttpStatus.CREATED)
                .then(({ body }) => {
                    expect(body).toMatchObject<GeneratedTokensDto>(GENERATED_TOKENS_DTO);
                });
        });

        it('return CONFLICT error if user already exists', () => {
            return request(app.getHttpServer())
                .post('/authentication/sign-up')
                .send(SIGN_UP_DTO)
                .expect(HttpStatus.CONFLICT)
                .then(({ body }) => {
                    expect(body).toMatchObject(CONFLICT_ERROR_RESPONSE);
                });
        });
    });

    describe('POST /authentication/sign-in', () => {
        it('return generated tokens', () => {
            return request(app.getHttpServer())
                .post('/authentication/sign-in')
                .send(SIGN_IN_DTO)
                .expect(HttpStatus.OK)
                .then(({ body }) => {
                    expect(body).toMatchObject<GeneratedTokensDto>(GENERATED_TOKENS_DTO);
                });
        });

        it('return UNAUTHORIZED error if user does not exist', () => {
            return request(app.getHttpServer())
                .post('/authentication/sign-in')
                .send({ ...SIGN_IN_DTO, email: 'non-existing-email' })
                .expect(HttpStatus.UNAUTHORIZED)
                .then(({ body }) => {
                    expect(body).toMatchObject(UNAUTHORIZED_ERROR_RESPONSE);
                });
        });

        it('return UNAUTHORIZED error if password is invalid', () => {
            return request(app.getHttpServer())
                .post('/authentication/sign-in')
                .send({ ...SIGN_IN_DTO, password: '0000' })
                .expect(HttpStatus.UNAUTHORIZED)
                .then(({ body }) => {
                    expect(body).toMatchObject(UNAUTHORIZED_ERROR_RESPONSE);
                });
        });
    });
});
