import { DeepPartial } from 'typeorm';

import { Transaction } from '../../shared/entities/transaction.entity';
import { Account } from '../../shared/entities/account.entity';
import { User } from '../../shared/entities/user.entity';
import { ECurrency } from '../../shared/enums/currency.enums';
import { ETransactionType } from '../../shared/enums/transaction.enums';

type TCreateTransferTransaction = (args: {
    user: User;
    account: Account;
    value: number;
    updatedBalance: number;
    currency: ECurrency;
    create(entityLike: DeepPartial<Transaction>): Promise<Transaction>;
    save(entity: Transaction): Promise<Transaction>;
}) => Promise<Transaction>;

export const createTransferTransaction: TCreateTransferTransaction = async ({
    user,
    account,
    value,
    currency,
    updatedBalance,
    create,
    save,
}) => {
    const transactionTemplate = await create({
        user,
        fromAccount: account,
        toAccount: account,
        type: ETransactionType.TRANSFER,
        value,
        currency,
        fromAccountUpdatedBalance: updatedBalance,
        toAccountUpdatedBalance: updatedBalance,
    });

    return save(transactionTemplate);
};
