import { ETransactionType } from 'shared/enums/transaction.enums';
import { Transaction } from 'shared/entities/transaction.entity';
import { Account } from 'shared/entities/account.entity';

import { ICalculatedTransactionValues } from 'transactions/interfaces/calculated-transaction-values.interface';
import { CalculatedTransactionValuesDto } from 'transactions/dtos/calculated-transaction-values.dto';

interface ICalculateTransactionValuesTransactionArgs {
    transaction: Transaction;
    account: Account;
    currentResult: ICalculatedTransactionValues;
}

const calculateTransactionValuesForTransferTransaction = ({
    transaction,
    account,
    currentResult,
}: ICalculateTransactionValuesTransactionArgs): ICalculatedTransactionValues => {
    const result = { ...currentResult };

    const { fromAccount, toAccount, value, fee, currency, currencyRate } = transaction;
    const { id: accountId } = account;

    if (accountId === fromAccount.id) {
        const valueWithFee = value + (fee || 0);

        const currentAmountByCurrency = result.from[currency] || 0;
        result.from[currency] = currentAmountByCurrency + valueWithFee;

        const currentOverallAmount = result.from.overall;
        result.from.overall = currentOverallAmount + valueWithFee;
    } else if (accountId === toAccount.id) {
        const currentAmountByCurrency = result.to[currency] || 0;
        result.to[currency] = currentAmountByCurrency + value;

        const currentOverallAmount = result.to.overall;
        result.to.overall = currentOverallAmount + value * (currencyRate || 1);
    }

    return result;
};

const calculateTransactionValuesForIncomeTransaction = ({
    transaction,
    account,
    currentResult,
}: ICalculateTransactionValuesTransactionArgs): ICalculatedTransactionValues => {
    const result = { ...currentResult };

    const { toAccount, value, fee, currency, currencyRate } = transaction;
    const { id: accountId } = account;

    if (accountId === toAccount.id) {
        const valueWithoutFee = value - (fee || 0);

        const currentAmountByCurrency = result.to[currency] || 0;
        result.to[currency] = currentAmountByCurrency + valueWithoutFee;

        const currentOverallAmount = result.to.overall;
        result.to.overall = currentOverallAmount + valueWithoutFee * (currencyRate || 1);
    }

    return result;
};

const calculateTransactionValuesForExpenseTransaction = ({
    transaction,
    account,
    currentResult,
}: ICalculateTransactionValuesTransactionArgs): ICalculatedTransactionValues => {
    const result = { ...currentResult };

    const { fromAccount, value, fee, currency } = transaction;
    const { id: accountId } = account;

    if (accountId === fromAccount.id) {
        const valueWithFee = value + (fee || 0);

        const currentAmountByCurrency = result.from[currency] || 0;
        result.from[currency] = currentAmountByCurrency + valueWithFee;

        const currentOverallAmount = result.from.overall;
        result.from.overall = currentOverallAmount + valueWithFee;
    }

    return result;
};

const calculateTransactionValuesForBalanceCorrectionTransaction = ({
    transaction,
    account,
    currentResult,
}: ICalculateTransactionValuesTransactionArgs): ICalculatedTransactionValues => {
    const result = { ...currentResult };

    const { fromAccount, toAccount, value } = transaction;
    const { id: accountId, currency } = account;

    if (accountId !== fromAccount.id || accountId !== toAccount.id) {
        return result;
    }

    if (value < 0) {
        const currentAmountByCurrency = result.from[currency] || 0;
        result.from[currency] = currentAmountByCurrency + Math.abs(value);

        const currentOverallAmount = result.from.overall;
        result.from.overall = currentOverallAmount + Math.abs(value);
    } else {
        const currentAmountByCurrency = result.to[currency] || 0;
        result.to[currency] = currentAmountByCurrency + value;

        const currentOverallAmount = result.to.overall;
        result.to.overall = currentOverallAmount + value;
    }

    return result;
};

interface ICalculateAccountTransactionsArgs {
    transactions: Transaction[];
    account: Account;
}

export const calculateAccountTransactions = ({
    transactions,
    account,
}: ICalculateAccountTransactionsArgs): CalculatedTransactionValuesDto => {
    let result: ICalculatedTransactionValues = {
        from: {
            overall: 0,
        },
        to: {
            overall: 0,
        },
    };

    transactions.forEach((transaction) => {
        const { type } = transaction;

        switch (type) {
            case ETransactionType.TRANSFER:
                result = calculateTransactionValuesForTransferTransaction({
                    transaction,
                    account,
                    currentResult: result,
                });
                return;

            case ETransactionType.INCOME:
                result = calculateTransactionValuesForIncomeTransaction({
                    transaction,
                    account,
                    currentResult: result,
                });
                return;

            case ETransactionType.EXPENSE:
                result = calculateTransactionValuesForExpenseTransaction({
                    transaction,
                    account,
                    currentResult: result,
                });
                return;

            case ETransactionType.BALANCE_CORRECTION:
                result = calculateTransactionValuesForBalanceCorrectionTransaction({
                    transaction,
                    account,
                    currentResult: result,
                });
                return;
        }
    });

    return {
        from: JSON.stringify(result.from),
        to: JSON.stringify(result.to),
    };
};
