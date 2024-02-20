import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';

import IsString from '../shared/property-decorators/is-string.decorator';
import { ECurrency } from '../shared/enums/currency.enums';
import { ELanguage } from '../shared/enums/language.enums';

import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH } from './users.constants';

export class CreateUserDto {
  @IsString({
    minLength: NICKNAME_MIN_LENGTH,
    maxLength: NICKNAME_MAX_LENGTH,
  })
  readonly nickname: string;

  @IsEnum(ECurrency)
  readonly defaultCurrency: ECurrency;

  @IsEnum(ELanguage)
  readonly language: ELanguage;
}

export class EditUserDto extends PartialType(
  OmitType(CreateUserDto, ['defaultCurrency']),
) {}

export class EditUserCurrencyDto extends PickType(CreateUserDto, [
  'defaultCurrency',
]) {
  @IsNumber()
  @IsPositive()
  rate: number;

  @IsOptional()
  @IsBoolean()
  isForceCurrencyUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  isSoftCurrencyUpdate?: boolean;
}
