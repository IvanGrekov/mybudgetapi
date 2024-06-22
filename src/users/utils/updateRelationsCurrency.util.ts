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
    isAccountsCurrencySoftUpdate?: boolean;
    isTransactionCategoriesCurrencySoftUpdate?: boolean;
    isTransactionCategoriesCurrencyForceUpdate?: boolean;
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
    isAccountsCurrencySoftUpdate,
    isTransactionCategoriesCurrencySoftUpdate,
    isTransactionCategoriesCurrencyForceUpdate,
}) => {
    const accountPartialEntity = {
        currency,
        balance: getCalculateNewAccountBalance(rate),
        initBalance: getCalculateNewAccountBalance(rate, true),
    };

    const transactionCategoryPartialEntity = {
        currency,
    };

    if (isAccountsCurrencySoftUpdate) {
        queryRunner.manager.update(
            Account,
            { user: { id: userId }, currency: oldCurrency },
            accountPartialEntity,
        );
    }

    if (isTransactionCategoriesCurrencySoftUpdate || isTransactionCategoriesCurrencyForceUpdate) {
        const criteria = isTransactionCategoriesCurrencyForceUpdate
            ? { user: { id: userId } }
            : { user: { id: userId }, currency: oldCurrency };

        queryRunner.manager.update(TransactionCategory, criteria, transactionCategoryPartialEntity);
    }
};
