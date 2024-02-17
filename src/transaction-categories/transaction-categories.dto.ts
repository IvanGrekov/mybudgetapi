import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';
import { ETransactionCategoryType } from '../shared/enums/transaction-categories.enums';

export class CreateTransactionCategoryDto extends PreloadTransactionCategoryDto {
  @IsNumber()
  readonly userId: number;
}

export class EditTransactionCategoryDto extends PartialType(
  PreloadTransactionCategoryDto,
) {}

export class FindAllTransactionCategoriesDto {
  @IsNumber()
  readonly userId: number;

  @IsOptional()
  @IsEnum(ETransactionCategoryType)
  readonly type?: ETransactionCategoryType;
}
