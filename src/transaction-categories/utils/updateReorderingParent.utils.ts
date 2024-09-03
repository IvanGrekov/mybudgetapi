import { FindOptionsRelations, UpdateResult } from 'typeorm';

import ArchivedEntityException from '../../shared/exceptions/archived-entity.exception';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ReorderParentTransactionCategoryDto } from '../dtos/reorder-parent-transaction-category.dto';
import { ETransactionCategoryStatus } from 'src/shared/enums/transaction-category.enums';

type TFindOneTransactionCategory = (
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
    findOneTransactionCategory: TFindOneTransactionCategory;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => Promise<void>;

const updateReorderingChild: TUpdateReorderingChild = async ({
    id,
    order,
    parentTransactionCategory,
    findOneTransactionCategory,
    updateTransactionCategory,
}) => {
    const childTransactionCategory = await findOneTransactionCategory(id);

    if (childTransactionCategory.status === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('child transactionCategory', id);
    }

    updateTransactionCategory(id, {
        order,
        parent: parentTransactionCategory,
    });
};

type TUpdateReorderingParent = (args: {
    parentNode: ReorderParentTransactionCategoryDto;
    findOneTransactionCategory: TFindOneTransactionCategory;
    updateTransactionCategory: TUpdateTransactionCategory;
}) => Promise<void>;

export const updateReorderingParent: TUpdateReorderingParent = async ({
    parentNode,
    findOneTransactionCategory,
    updateTransactionCategory,
}) => {
    const { id, order, childNodes } = parentNode;
    const parentTransactionCategory = await findOneTransactionCategory(id, {
        children: true,
    });

    if (parentTransactionCategory.status === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('parent transactionCategory', id);
    }

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
            parentTransactionCategory,
            findOneTransactionCategory,
            updateTransactionCategory,
        });
    }
};
