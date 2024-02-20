import { IsEnum, IsOptional, IsNumber as IsNumberBase } from 'class-validator';

import IsNumber from '../property-decorators/is-number.decorator';
import IsString from '../property-decorators/is-string.decorator';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionCategoryType } from '../enums/transaction-categories.enums';

export class PreloadTransactionCategoryDto {
  @IsString()
  readonly name: string;

  @IsEnum(ETransactionCategoryType)
  readonly type: ETransactionCategoryType;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @IsNumberBase()
  @IsOptional()
  readonly parentId?: number;

  @IsNumber()
  @IsOptional()
  readonly order?: number;
}
