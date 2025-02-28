import { registerAs } from '@nestjs/config';

export default registerAs('database-test', () => ({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_TEST_CONTAINER_PORT, 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
}));
