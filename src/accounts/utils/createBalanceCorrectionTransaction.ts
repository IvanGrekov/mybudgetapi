import { DeepPartial } from 'typeorm';

import { Transaction } from 'shared/entities/transaction.entity';
import { Account } from 'shared/entities/account.entity';
import { User } from 'shared/entities/user.entity';
import { ETransactionType } from 'shared/enums/transaction.enums';

type TCreateBalanceCorrectionTransaction = (args: {
    user: User;
    account: Account;
    value: number;
    updatedBalance: number;
    createTransaction(entityLike: DeepPartial<Transaction>): Transaction;
    saveTransaction(entity: Transaction): Promise<Transaction>;
}) => Promise<Transaction>;

export const createBalanceCorrectionTransaction: TCreateBalanceCorrectionTransaction = async ({
    user,
    account,
    value,
    updatedBalance,
    createTransaction,
    saveTransaction,
}) => {
    const transactionTemplate = createTransaction({
        user,
        fromAccount: account,
        toAccount: account,
        type: ETransactionType.BALANCE_CORRECTION,
        value,
        currency: account.currency,
        fromAccountUpdatedBalance: updatedBalance,
        toAccountUpdatedBalance: updatedBalance,
    });

    return saveTransaction(transactionTemplate);
};
