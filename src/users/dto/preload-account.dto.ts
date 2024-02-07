import {
  IsEnum,
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

import { DEFAULT_MAX_LENGTH } from '../../shared/constants/stringFields.constant';

import { ECurrency } from '../enums/currency.enum';
import { EAccountType } from '../enums/accountType.enum';

export class PreloadAccountDto {
  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @IsEnum(EAccountType)
  readonly type: EAccountType;

  @IsNumber()
  readonly balance: number;
}
