import { IsEnum, IsString, MinLength, MaxLength } from 'class-validator';

import { DEFAULT_MAX_LENGTH } from '../../shared/constants/stringFields.constant';

import { ECurrency } from '../enums/currency.enum';
import { ELanguage } from '../enums/language.enum';

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
