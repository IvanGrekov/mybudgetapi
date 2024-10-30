import { FindOptionsRelations } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IGetOneTransactionCategoryArgs {
    id: number;
    activeUserId?: number;
    relations?: FindOptionsRelations<TransactionCategory>;
}
