import { registerAs } from '@nestjs/config';
import * as Joi from '@hapi/joi';

export default registerAs('app', () => ({
    isDevelopment: ['development', 'test'].includes(process.env.NODE_ENV),
}));

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

    DB_HOST: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_IMAGE_NAME: Joi.string().required(),
    DB_CONTAINER_PORT: Joi.number().required(),
    DB_TEST_CONTAINER_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),

    REDIS_HOST: Joi.string().required(),
    REDIS_IMAGE_NAME: Joi.string().required(),
    REDIS_CONTAINER_PORT: Joi.number().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
    JWT_ACCESS_TOKEN_TTL: Joi.string().required(),
    JWT_REFRESH_TOKEN_TTL: Joi.string().required(),
    JWT_RESET_PASSWORD_TTL: Joi.string().required(),

    AUTH_CLIENT_ID: Joi.string().required(),
    AUTH_CLIENT_SECRET: Joi.string().required(),

    TFA_APP_NAME: Joi.string().required(),

    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().required(),
    EMAIL_USERNAME: Joi.string().required(),
    EMAIL_SENDER_DOMAIN: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
});
