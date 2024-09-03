import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export const getParentTransactionCategories = (
    transactionCategories: TransactionCategory[],
): TransactionCategory[] => {
    return transactionCategories.filter(({ parent }) => !parent);
};
