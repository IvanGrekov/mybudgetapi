import {
  IsEnum,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
} from 'class-validator';

import { DEFAULT_MAX_LENGTH } from '../../shared/constants/stringFields.constant';

import { ECurrency } from '../enums/currency.enum';
import { ETransactionCategoryType } from '../enums/transaction-category-type.enum';

export class PreloadTransactionCategoryDto {
  @IsEnum(ETransactionCategoryType)
  readonly type: ETransactionCategoryType;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly order: number;
}
