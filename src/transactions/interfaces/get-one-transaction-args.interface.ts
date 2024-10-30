import { FindOptionsRelations } from 'typeorm';

import { Transaction } from '../../shared/entities/transaction.entity';

export interface IGetOneTransactionArgs {
    id: number;
    activeUserId?: number;
    relations?: FindOptionsRelations<Transaction>;
}
