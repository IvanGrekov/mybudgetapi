import { PickType } from '@nestjs/mapped-types';

import { PreloadTransactionCategoryDto } from '../../shared/dtos/preload-transaction-category.dto';

export class EditTransactionCategoryCurrencyDto extends PickType(
  PreloadTransactionCategoryDto,
  ['currency'],
) {}
