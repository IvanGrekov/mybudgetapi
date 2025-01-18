import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenExpiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
    refreshTokenExpiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '2592000', 10),
    resetPasswordTokenExpiresIn: parseInt(process.env.JWT_RESET_PASSWORD_TTL ?? '1800', 10),
}));
