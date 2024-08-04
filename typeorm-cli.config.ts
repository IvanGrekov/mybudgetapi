import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: parseInt(process.env.DB_CONTAINER_PORT),
    database: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    entities: [],
    migrations: [],
});
