import { DEFAULT_CURRENCY } from 'shared/constants/currency.constants';
import { DEFAULT_LANGUAGE } from 'shared/constants/language.constants';

import { SignUpDto } from 'iam/authentication/dtos/sign-up.dto';

export const SIGN_UP_DTO: SignUpDto = {
    email: 'john.doe@example.com',
    password: 'password',
    nickname: 'test',
    deviceId: 'deviceId',
    defaultCurrency: DEFAULT_CURRENCY,
    language: DEFAULT_LANGUAGE,
    timeZone: 'Europe/Kyiv',
};
