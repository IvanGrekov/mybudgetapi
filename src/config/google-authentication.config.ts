import { registerAs } from '@nestjs/config';

export default registerAs('google-authentication', () => ({
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
}));
