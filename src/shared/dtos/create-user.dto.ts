import { IsEmail, IsEnum, IsDefined, IsOptional } from 'class-validator';

import IsString from '../property-decorators/is-string.decorator';
import { ECurrency } from '../enums/currency.enums';
import { ELanguage } from '../enums/language.enums';

import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH } from '../constants/nickname.constants';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../constants/password.constants';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString({
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    password: string;

    @IsOptional()
    @IsString({
        minLength: NICKNAME_MIN_LENGTH,
        maxLength: NICKNAME_MAX_LENGTH,
    })
    readonly nickname?: string;

    @IsOptional()
    @IsEnum(ECurrency)
    readonly defaultCurrency?: ECurrency;

    @IsOptional()
    @IsEnum(ELanguage)
    readonly language?: ELanguage;

    @IsOptional()
    @IsString()
    readonly timeZone?: string;
}
