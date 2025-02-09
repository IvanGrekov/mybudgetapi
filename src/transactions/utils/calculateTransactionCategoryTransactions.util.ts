import { ETransactionCategoryType } from 'shared/enums/transaction-category.enums';
import { ETransactionType } from 'shared/enums/transaction.enums';
import { Transaction } from 'shared/entities/transaction.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';

import { ICalculatedTransactionValuesItem } from 'transactions/interfaces/calculated-transaction-values.interface';
import { CalculatedTransactionValuesDto } from 'transactions/dtos/calculated-transaction-values.dto';

const calculateExpenseCategoryTransactions = (
    transactions: Transaction[],
): ICalculatedTransactionValuesItem => {
    const result: ICalculatedTransactionValuesItem = {
        overall: 0,
    };

    transactions.forEach(({ type, value, currency, currencyRate }) => {
        if (type !== ETransactionType.EXPENSE) {
            return;
        }

        const currentAmountByCurrency = result[currency] || 0;
        result[currency] = currentAmountByCurrency + value;

        const currentOverallAmount = result.overall;
        result.overall = currentOverallAmount + value * (currencyRate || 1);
    });

    return result;
};

const calculateIncomeCategoryTransactions = (
    transactions: Transaction[],
): ICalculatedTransactionValuesItem => {
    const result: ICalculatedTransactionValuesItem = {
        overall: 0,
    };

    transactions.forEach(({ type, value, currency }) => {
        if (type !== ETransactionType.INCOME) {
            return;
        }

        const currentAmountByCurrency = result[currency] || 0;
        result[currency] = currentAmountByCurrency + value;

        const currentOverallAmount = result.overall;
        result.overall = currentOverallAmount + value;
    });

    return result;
};

interface ICalculateTransactionCategoryTransactionsArgs {
    transactions: Transaction[];
    transactionCategory: TransactionCategory;
}

export const calculateTransactionCategoryTransactions = ({
    transactions,
    transactionCategory,
}: ICalculateTransactionCategoryTransactionsArgs): CalculatedTransactionValuesDto => {
    switch (transactionCategory.type) {
        case ETransactionCategoryType.EXPENSE:
            return {
                to: JSON.stringify(calculateExpenseCategoryTransactions(transactions)),
            };

        case ETransactionCategoryType.INCOME:
            return {
                from: JSON.stringify(calculateIncomeCategoryTransactions(transactions)),
            };

        default:
            return {};
    }
};
