import { QueryRunner } from 'typeorm';

import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { ECurrency } from 'shared/enums/currency.enums';

type TUpdateRelationsCurrency = (args: {
    queryRunner: QueryRunner;
    currency: ECurrency;
    rate: number;
    isAccountsCurrencySoftUpdate?: boolean;
    isTransactionCategoriesCurrencySoftUpdate?: boolean;
    isTransactionCategoriesCurrencyForceUpdate?: boolean;
    getAccountsWithoutTransactions: () => Promise<Account[]>;
    getTransactionCategoriesWithoutTransactions: () => Promise<TransactionCategory[]>;
}) => Promise<void>;

const getCalculateNewAccountBalance = (rate: number, isInitBalance?: boolean) => {
    const fieldName = isInitBalance ? 'initBalance' : 'balance';

    return () => `${fieldName} * ${rate}`;
};

export const updateRelationsCurrency: TUpdateRelationsCurrency = async ({
    queryRunner,
    currency,
    rate,
    isAccountsCurrencySoftUpdate,
    isTransactionCategoriesCurrencySoftUpdate,
    isTransactionCategoriesCurrencyForceUpdate,
    getAccountsWithoutTransactions,
    getTransactionCategoriesWithoutTransactions,
}) => {
    if (isAccountsCurrencySoftUpdate) {
        const accountsWithoutTransactions = await getAccountsWithoutTransactions();

        for (const { id } of accountsWithoutTransactions) {
            await queryRunner.manager.update(
                Account,
                {
                    id,
                },
                {
                    currency,
                    balance: getCalculateNewAccountBalance(rate),
                    initBalance: getCalculateNewAccountBalance(rate, true),
                },
            );
        }
    }

    if (isTransactionCategoriesCurrencySoftUpdate || isTransactionCategoriesCurrencyForceUpdate) {
        const transactionCategoriesWithoutTransactions =
            await getTransactionCategoriesWithoutTransactions();

        for (const { id } of transactionCategoriesWithoutTransactions) {
            await queryRunner.manager.update(
                TransactionCategory,
                { id },
                {
                    currency,
                },
            );
        }
    }
};
