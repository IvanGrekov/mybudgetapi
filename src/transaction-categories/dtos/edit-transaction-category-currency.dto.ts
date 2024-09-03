import { PickType } from '@nestjs/swagger';

import { PreloadTransactionCategoryDto } from '../../shared/dtos/preload-transaction-category.dto';

export class EditTransactionCategoryCurrencyDto extends PickType(PreloadTransactionCategoryDto, [
    'currency',
]) {}
