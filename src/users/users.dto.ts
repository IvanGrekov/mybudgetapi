import {
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';

import { DEFAULT_MAX_LENGTH } from '../shared/constants/string-fields.constants';
import { ECurrency } from '../shared/enums/currency.enums';
import { ELanguage } from '../shared/enums/language.enums';

export class CreateUserDto {
  @MinLength(3)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
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
  @IsOptional()
  @IsBoolean()
  isForceCurrencyUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  isSoftCurrencyUpdate?: boolean;

  @IsOptional()
  @IsNumber()
  rate?: number;
}
