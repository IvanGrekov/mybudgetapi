import { QueryRunner } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IUnassignChildrenFromParentArgs {
  queryRunner: QueryRunner;
  userId: number;
  children: TransactionCategory[];
}
