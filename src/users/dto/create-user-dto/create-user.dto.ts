import { IsEnum, IsString, MinLength } from 'class-validator';

import { ECurrency } from '../../../shared/enums/currency.enum';
import { ELanguage } from '../../entities/user.entity';

export class CreateUserDto {
  @MinLength(3)
  @IsString()
  readonly nickname: string;

  @IsEnum(ECurrency)
  readonly defaultCurrency: ECurrency;

  @IsEnum(ELanguage)
  readonly language: ELanguage;
}
