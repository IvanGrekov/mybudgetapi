import { TransactionCategory } from 'shared/entities/transaction-category.entity';

export const getChildrenTransactionCategories = (
    transactionCategories: TransactionCategory[],
): TransactionCategory[] => {
    const result: TransactionCategory[] = [];

    transactionCategories.forEach(({ children }) => {
        children && result.push(...children);
    });

    return result;
};
