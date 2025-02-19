import { HttpStatus } from '@nestjs/common';

import { DEFAULT_CURRENCY } from 'shared/constants/currency.constants';
import { DEFAULT_LANGUAGE } from 'shared/constants/language.constants';

import { SignUpDto } from 'iam/authentication/dtos/sign-up.dto';
import { SignInDto } from 'iam/authentication/dtos/sign-in.dto';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';

const EMAIL = 'test@test.com';
const PASSWORD = 'password';

export const SIGN_UP_DTO: SignUpDto = {
    email: EMAIL,
    password: PASSWORD,
    nickname: 'test',
    deviceId: 'deviceId',
    defaultCurrency: DEFAULT_CURRENCY,
    language: DEFAULT_LANGUAGE,
    timeZone: 'Europe/Kyiv',
};

export const SIGN_IN_DTO: SignInDto = {
    email: EMAIL,
    password: PASSWORD,
    deviceId: 'deviceId',
};

export const GENERATED_TOKENS_DTO: GeneratedTokensDto = {
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
};

export const CONFLICT_ERROR_RESPONSE = {
    statusCode: HttpStatus.CONFLICT,
    message: 'User with this email already exists',
};

export const UNAUTHORIZED_ERROR_RESPONSE = {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Invalid email or password',
};
