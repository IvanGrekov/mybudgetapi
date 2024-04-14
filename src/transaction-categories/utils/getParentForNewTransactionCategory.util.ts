import { ConflictException } from '@nestjs/common';

import { FindOptionsRelations } from 'typeorm';

import { getIdPointer } from '../../shared/utils/idPointer.utils';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

type TGetParentForNewTransactionCategory = (args: {
    parentId: number;
    userId: number;
    type: ETransactionCategoryType;
    findOneTransactionCategory(
        id: TransactionCategory['id'],
        relations?: FindOptionsRelations<TransactionCategory>,
    ): Promise<TransactionCategory>;
}) => Promise<TransactionCategory['parent']>;

export const getParentForNewTransactionCategory: TGetParentForNewTransactionCategory = async ({
    parentId,
    type,
    userId,
    findOneTransactionCategory,
}) => {
    if (!parentId) {
        return null;
    }

    const parentTransactionCategory = await findOneTransactionCategory(parentId, {
        user: true,
    });
    const { user: parentUser, type: parentType } = parentTransactionCategory;

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

    return parentTransactionCategory;
};
