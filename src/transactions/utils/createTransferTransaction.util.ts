import { FindOneOptions } from 'typeorm';

import { Transaction } from '../../shared/entities/transaction.entity';
import { Account } from '../../shared/entities/account.entity';

import { CreateTransactionDto } from '../dtos/create-transaction.dto';

type TCreateTransferTransaction = ({
    createTransactionDto,
    findAccountById,
    saveAccount,
}: {
    createTransactionDto: CreateTransactionDto;
    findAccountById(options: FindOneOptions<Account>): Promise<Account>;
    saveAccount(entity: Account): Promise<Account>;
}) => Transaction;

export const createTransferTransaction: TCreateTransferTransaction = ({}) => {
    // TODO: update fromAccount balance (IG)
    // TODO: update toAccount balance (IG)
    // TODO: add fromAccountUpdatedBalance (IG)
    // TODO: add toAccountUpdatedBalance (IG)
    // TODO: check if accounts belong to the same user (IG)
    return {} as Transaction;
};
