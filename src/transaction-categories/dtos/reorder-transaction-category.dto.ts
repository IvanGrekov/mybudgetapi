import { IsNumber as IsNumberBase } from 'class-validator';

import IsNumber from '../../shared/property-decorators/is-number.decorator';

import { MAX_TRANSACTION_CATEGORIES_PER_USER } from '../constants/transaction-categories-pagination.constants';

export class ReorderTransactionCategoryDto {
  @IsNumberBase()
  readonly id: number;

  @IsNumber({
    max: MAX_TRANSACTION_CATEGORIES_PER_USER,
  })
  readonly order: number;
}
