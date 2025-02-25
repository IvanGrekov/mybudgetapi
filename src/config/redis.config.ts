import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_CONTAINER_PORT, 10),
    expiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '2592000', 10), // 30 days
}));
