import { QueryRunner } from 'typeorm';

import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

export interface ISyncTransactionCategoriesOrder {
  queryRunner: QueryRunner;
  userId: number;
  type: ETransactionCategoryType;
  excludeId?: number;
  parentId?: number;
}
