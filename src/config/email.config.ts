import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
}));
