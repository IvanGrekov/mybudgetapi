import { registerAs } from '@nestjs/config';
import * as Joi from '@hapi/joi';

export default registerAs('app', () => ({
    isDevelopment: process.env.NODE_ENV === 'development',
}));

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').required(),
    DB_HOST: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_IMAGE_NAME: Joi.string().required(),
    DB_CONTAINER_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_TOKEN_AUDIENCE: Joi.string().required(),
    JWT_TOKEN_ISSUER: Joi.string().required(),
    JWT_ACCESS_TOKEN_TTL: Joi.string().required(),
    JWT_REFRESH_TOKEN_TTL: Joi.string().required(),
    API_KEY: Joi.string().required(),
});
