import { UpdateResult } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

type TUpdateTransactionCategory = (
    id: number,
    transactionCategory: Partial<TransactionCategory>,
) => Promise<UpdateResult>;

type TExtractChildrenTransactionCategories = (args: {
    children: TransactionCategory[];
    currentParentsLength: number;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => void;

export const extractChildrenTransactionCategories: TExtractChildrenTransactionCategories = ({
    children,
    currentParentsLength,
    updateTransactionCategory,
}) => {
    children.forEach(({ id: transactionCategoryId }, i) => {
        updateTransactionCategory(transactionCategoryId, {
            order: currentParentsLength + i,
            parent: null,
        });
    });
};
