import { Transaction } from '../../shared/entities/transaction.entity';

import { CreateTransactionDto } from '../dtos/create-transaction.dto';

export const createIncomeTransaction = async ({}: CreateTransactionDto): Promise<Transaction> => {
    return {} as Transaction;
};
