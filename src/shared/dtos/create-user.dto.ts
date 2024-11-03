import { IsEmail, IsEnum, IsOptional, IsString as IsStringBase } from 'class-validator';

import IsString from 'shared/property-decorators/is-string.decorator';
import { ECurrency } from 'shared/enums/currency.enums';
import { ELanguage } from 'shared/enums/language.enums';

import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH } from 'shared/constants/nickname.constants';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from 'shared/constants/password.constants';

export class CreateUserDto {
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsStringBase()
    readonly googleId?: string;

    @IsOptional()
    @IsString({
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    readonly password?: string;

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
