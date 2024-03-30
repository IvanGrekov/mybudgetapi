import { QueryRunner } from 'typeorm';

import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

export interface ISyncTransactionCategoriesOrderArgs {
    queryRunner: QueryRunner;
    userId: number;
    type: ETransactionCategoryType;
    excludeId?: number;
    parentId?: number;
}
