import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

const sortTransactionCategories = <T extends { order: number }>(
    transactionCategories: T[],
): T[] => {
    return transactionCategories.sort((a, b) => a.order - b.order);
};

export const sortChildTransactionCategories = (
    transactionCategories: TransactionCategory[],
): TransactionCategory[] => {
    return transactionCategories.map((transactionCategory) => {
        const { children } = transactionCategory;

        if (Array.isArray(children)) {
            transactionCategory.children = sortTransactionCategories(children);
        }

        return transactionCategory;
    });
};
