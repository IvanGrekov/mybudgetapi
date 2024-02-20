import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  readonly parentId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly order?: number;
}
