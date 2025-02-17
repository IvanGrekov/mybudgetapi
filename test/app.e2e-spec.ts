import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from 'app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('GET /users/name', () => {
        it('return 200 status', async () => {
            request(app.getHttpServer()).get('/users/name').expect(200);
        });

        it('return new user name', async () => {
            const response = await request(app.getHttpServer()).get('/users/name');
            expect(response.text).toMatch(/User#/);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
