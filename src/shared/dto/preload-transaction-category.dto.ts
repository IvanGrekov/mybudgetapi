import {
  IsEnum,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

import { DEFAULT_MAX_LENGTH } from '../constants/string-fields.constants';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionCategoryType } from '../enums/transaction-categories.enums';

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
  @Min(0)
  readonly order: number;

  @IsOptional()
  @IsNumber()
  readonly parentId?: number;
}
