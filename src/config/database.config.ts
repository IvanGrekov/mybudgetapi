import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_CONTAINER_PORT, 10),
    name: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    synchronize: process.env.NODE_ENV === 'development',
}));
