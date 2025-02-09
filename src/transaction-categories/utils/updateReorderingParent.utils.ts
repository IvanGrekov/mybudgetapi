import { FindOptionsRelations, UpdateResult } from 'typeorm';

import ArchivedEntityException from 'shared/exceptions/archived-entity.exception';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { ETransactionCategoryStatus } from 'shared/enums/transaction-category.enums';

import { ReorderParentTransactionCategoryDto } from 'transaction-categories/dtos/reorder-parent-transaction-category.dto';

type TGetOneTransactionCategory = (
    id: TransactionCategory['id'],
    relations?: FindOptionsRelations<TransactionCategory>,
) => Promise<TransactionCategory>;

type TUpdateTransactionCategory = (
    id: number,
    transactionCategory: Partial<TransactionCategory>,
) => Promise<UpdateResult>;

type TUpdateReorderingChild = (args: {
    id: number;
    order: number;
    parentTransactionCategory: TransactionCategory;
    getOneTransactionCategory: TGetOneTransactionCategory;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => Promise<void>;

const updateReorderingChild: TUpdateReorderingChild = async ({
    id,
    order,
    parentTransactionCategory,
    getOneTransactionCategory,
    updateTransactionCategory,
}) => {
    const childTransactionCategory = await getOneTransactionCategory(id);

    if (childTransactionCategory.status === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('child transactionCategory', id);
    }

    await updateTransactionCategory(id, {
        order,
        parent: parentTransactionCategory,
    });
};

type TUpdateReorderingParent = (args: {
    parentNode: ReorderParentTransactionCategoryDto;
    getOneTransactionCategory: TGetOneTransactionCategory;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => Promise<void>;

export const updateReorderingParent: TUpdateReorderingParent = async ({
    parentNode,
    getOneTransactionCategory,
    updateTransactionCategory,
}) => {
    const { id, order, childNodes } = parentNode;
    const parentTransactionCategory = await getOneTransactionCategory(id, {
        children: true,
    });

    if (parentTransactionCategory.status === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('parent transactionCategory', id);
    }

    await updateTransactionCategory(id, {
        order,
        parent: null,
    });

    if (!childNodes) {
        return;
    }

    for (const childNode of childNodes) {
        await updateReorderingChild({
            ...childNode,
            parentTransactionCategory,
            getOneTransactionCategory,
            updateTransactionCategory,
        });
    }
};
