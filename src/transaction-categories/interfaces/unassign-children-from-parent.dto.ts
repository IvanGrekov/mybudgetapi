import { QueryRunner } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IUnassignChildrenFromParent {
  queryRunner: QueryRunner;
  userId: number;
  children: TransactionCategory[];
}
