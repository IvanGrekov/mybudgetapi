import { registerAs } from '@nestjs/config';

export default registerAs('tfa-authentication', () => ({
    tfaAppName: process.env.TFA_APP_NAME,
}));
