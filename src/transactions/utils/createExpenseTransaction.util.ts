import { Transaction } from '../../shared/entities/transaction.entity';

import { CreateTransactionDto } from '../dtos/create-transaction.dto';

export const createExpenseTransaction = async ({}: CreateTransactionDto): Promise<Transaction> => {
    return {} as Transaction;
};
