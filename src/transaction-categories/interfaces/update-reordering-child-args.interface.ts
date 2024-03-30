import { QueryRunner } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IUpdateReorderingChildArgs {
    queryRunner: QueryRunner;
    id: number;
    order: number;
    parentTransactionCategory: TransactionCategory;
}
