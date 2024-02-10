import { PartialType } from '@nestjs/mapped-types';

import { PreloadTransactionCategoryDto } from './preload-transaction-category.dto';

export class EditTransactionCategoryDto extends PartialType(
  PreloadTransactionCategoryDto,
) {}
