import { IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';

export class CreateTransactionCategoryDto extends PreloadTransactionCategoryDto {
  @IsNumber()
  readonly userId: number;
}

export class EditTransactionCategoryDto extends PartialType(
  PreloadTransactionCategoryDto,
) {}
