import { DataSource } from 'typeorm';
import 'dotenv/config';

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_CONTAINER_PORT, 10),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: ['dist/src/**/*.entity.js'],
    migrations: ['dist/src/migrations/*.js'],
});
