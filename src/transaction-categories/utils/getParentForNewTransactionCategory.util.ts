import { ConflictException } from '@nestjs/common';

import { FindOptionsRelations } from 'typeorm';

import { getIdPointer } from '../../shared/utils/idPointer.utils';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

type TGetParentForNewTransactionCategory = (args: {
    parentId: number;
    userId: number;
    type: ETransactionCategoryType;
    getOneTransactionCategory(
        id: TransactionCategory['id'],
        relations?: FindOptionsRelations<TransactionCategory>,
    ): Promise<TransactionCategory>;
}) => Promise<TransactionCategory['parent']>;

export const getParentForNewTransactionCategory: TGetParentForNewTransactionCategory = async ({
    parentId,
    type,
    userId,
    getOneTransactionCategory,
}) => {
    if (!parentId) {
        return null;
    }

    const parentTransactionCategory = await getOneTransactionCategory(parentId, {
        user: true,
        parent: true,
    });
    const { user: parentUser, type: parentType, parent } = parentTransactionCategory;

    if (userId !== parentUser.id) {
        throw new ConflictException(
            `Parent TransactionCategory ${getIdPointer(parentId)} belongs to another User`,
        );
    }

    if (type !== parentType) {
        throw new ConflictException(
            `Parent TransactionCategory ${getIdPointer(parentId)} \`type\` is different from the new TransactionCategory \`type\``,
        );
    }

    if (parent) {
        throw new ConflictException(
            `TransactionCategory ${getIdPointer(parentId)} already a child of another TransactionCategory`,
        );
    }

    return parentTransactionCategory;
};
