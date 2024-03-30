import { IsNumber as IsNumberBase, IsDefined } from 'class-validator';

import IsNumber from '../../shared/property-decorators/is-number.decorator';

import { MAX_TRANSACTION_CATEGORIES_PER_USER } from '../constants/transaction-categories-pagination.constants';

export class ReorderTransactionCategoryDto {
    @IsNumberBase()
    readonly id: number;

    @IsDefined()
    @IsNumber({
        max: MAX_TRANSACTION_CATEGORIES_PER_USER,
    })
    readonly order: number;
}
