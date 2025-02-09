import { UpdateResult } from 'typeorm';

import { TransactionCategory } from 'shared/entities/transaction-category.entity';

type TUpdateTransactionCategory = (
    id: number,
    transactionCategory: Partial<TransactionCategory>,
) => Promise<UpdateResult>;

type TExtractChildrenTransactionCategories = (args: {
    children: TransactionCategory[];
    currentParentsLength: number;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => Promise<void>;

export const extractChildrenTransactionCategories: TExtractChildrenTransactionCategories = async ({
    children,
    currentParentsLength,
    updateTransactionCategory,
}) => {
    for (let i = 0; i < children.length; i++) {
        await updateTransactionCategory(children[i].id, {
            order: currentParentsLength + i,
            parent: null,
        });
    }
};
