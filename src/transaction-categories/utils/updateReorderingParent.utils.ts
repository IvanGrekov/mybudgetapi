import { FindOptionsRelations, UpdateResult } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ReorderParentTransactionCategoryDto } from '../dtos/reorder-parent-transaction-category.dto';

type TUpdateReorderingChild = (args: {
    id: number;
    order: number;
    parentTransactionCategory: TransactionCategory;
    updateTransactionCategory(
        id: number,
        transactionCategory: Partial<TransactionCategory>,
    ): Promise<UpdateResult>;
}) => Promise<void>;

const updateReorderingChild: TUpdateReorderingChild = async ({
    id,
    order,
    parentTransactionCategory,
    updateTransactionCategory,
}) => {
    updateTransactionCategory(id, {
        order,
        parent: parentTransactionCategory,
    });
};

type TUpdateReorderingParent = (args: {
    parentNode: ReorderParentTransactionCategoryDto;
    findOneTransactionCategory(
        id: TransactionCategory['id'],
        relations?: FindOptionsRelations<TransactionCategory>,
    ): Promise<TransactionCategory>;
    updateTransactionCategory(
        id: number,
        transactionCategory: Partial<TransactionCategory>,
    ): Promise<UpdateResult>;
}) => Promise<void>;

export const updateReorderingParent: TUpdateReorderingParent = async ({
    parentNode,
    findOneTransactionCategory,
    updateTransactionCategory,
}) => {
    const { id, order, childNodes } = parentNode;
    const transactionCategory = await findOneTransactionCategory(id, {
        parent: true,
        children: true,
    });

    updateTransactionCategory(id, {
        order,
        parent: null,
    });

    if (!childNodes) {
        return;
    }

    for (const childNode of childNodes) {
        await updateReorderingChild({
            ...childNode,
            parentTransactionCategory: transactionCategory,
            updateTransactionCategory,
        });
    }
};
