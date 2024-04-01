import { QueryRunner } from 'typeorm';

import { Account } from '../../shared/entities/account.entity';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ECurrency } from '../../shared/enums/currency.enums';

type TUpdateRelationsCurrency = (args: {
    queryRunner: QueryRunner;
    userId: number;
    currency: ECurrency;
    oldCurrency: ECurrency;
    rate: number;
    isForceCurrencyUpdate?: boolean;
}) => Promise<void>;

export const getCalculateNewAccountBalance = (rate: number, isInitBalance?: boolean) => {
    const fieldName = isInitBalance ? 'initBalance' : 'balance';

    return () => `${fieldName} * ${rate}`;
};

export const updateRelationsCurrency: TUpdateRelationsCurrency = async ({
    queryRunner,
    userId,
    currency,
    oldCurrency,
    rate,
    isForceCurrencyUpdate,
}) => {
    const criteria = isForceCurrencyUpdate
        ? { user: { id: userId } }
        : { user: { id: userId }, currency: oldCurrency };

    const accountPartialEntity = {
        currency,
        balance: getCalculateNewAccountBalance(rate),
        initBalance: getCalculateNewAccountBalance(rate, true),
    };

    const transactionCategoryPartialEntity = {
        currency,
    };

    if (isForceCurrencyUpdate) {
        queryRunner.manager.update(Account, criteria, accountPartialEntity);
        queryRunner.manager.update(TransactionCategory, criteria, transactionCategoryPartialEntity);
    } else {
        queryRunner.manager.update(Account, criteria, accountPartialEntity);
        queryRunner.manager.update(TransactionCategory, criteria, transactionCategoryPartialEntity);
    }
};
