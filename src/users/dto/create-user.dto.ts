import { IsEnum, IsString, MinLength, MaxLength } from 'class-validator';

import { ECurrency } from '../../shared/enums/currency.enum';
import { ELanguage } from '../../shared/entities/user.entity';
import { DEFAULT_MAX_LENGTH } from '../../shared/constants/stringFields.constant';

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
