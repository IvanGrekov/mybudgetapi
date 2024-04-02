import { InternalServerErrorException } from '@nestjs/common';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ETransactionCategoryStatus } from '../../shared/enums/transaction-category.enums';
import { EditTransactionCategoryDto } from '../dtos/edit-transaction-category.dto';
import { FindAllTransactionCategoriesDto } from '../dtos/find-all-transaction-categories.dto';

type TGetOldTransactionCategoryNewOrder = (args: {
    oldTransactionCategory: TransactionCategory;
    editTransactionCategoryDto: EditTransactionCategoryDto;
    findAllTransactionCategories(
        args: FindAllTransactionCategoriesDto,
    ): Promise<TransactionCategory[]>;
}) => Promise<number>;

export const getOldTransactionCategoryNewOrder: TGetOldTransactionCategoryNewOrder = async ({
    oldTransactionCategory,
    editTransactionCategoryDto,
    findAllTransactionCategories,
}) => {
    const { status, type, user, order } = oldTransactionCategory;
    const { status: newStatus, type: newType } = editTransactionCategoryDto;

    const isTypeChanging = typeof newType !== 'undefined' && newType !== type;
    const isStatusChanging =
        newStatus !== status && newStatus === ETransactionCategoryStatus.ACTIVE;

    if (!isTypeChanging && !isStatusChanging) {
        return order;
    }

    if (!user) {
        throw new InternalServerErrorException('Old TransactionCategory has no User');
    }

    if (isTypeChanging) {
        const transactionCategoriesByType = await findAllTransactionCategories({
            userId: user.id,
            type: newType,
        });

        return transactionCategoriesByType.length;
    }

    const transactionCategoriesByOldType = await findAllTransactionCategories({
        userId: user.id,
        type,
    });

    return transactionCategoriesByOldType.length;
};
