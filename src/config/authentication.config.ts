import { registerAs } from '@nestjs/config';

export default registerAs('authentication', () => ({
    apiKey: process.env.API_KEY,
}));
