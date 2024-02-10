import { IsNumber } from 'class-validator';

import { PreloadTransactionCategoryDto } from './preload-transaction-category.dto';

export class CreateTransactionCategoryDto extends PreloadTransactionCategoryDto {
  @IsNumber()
  readonly userId: number;
}
