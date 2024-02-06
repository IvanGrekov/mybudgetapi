import {
  IsEnum,
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

import { ECurrency } from '../../shared/enums/currency.enum';
import { EAccountType } from '../../shared/entities/account.entity';
import { DEFAULT_MAX_LENGTH } from '../../shared/constants/stringFields.constant';

export class CreateAccountDto {
  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly userId: number;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @IsEnum(EAccountType)
  readonly type: EAccountType;

  @IsNumber()
  readonly balance: number;
}
