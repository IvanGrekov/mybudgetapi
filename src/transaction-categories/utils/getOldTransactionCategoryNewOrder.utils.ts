import { InternalServerErrorException } from '@nestjs/common';

import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { ETransactionCategoryStatus } from 'shared/enums/transaction-category.enums';

import { EditTransactionCategoryDto } from 'transaction-categories/dtos/edit-transaction-category.dto';
import { FindAllTransactionCategoriesDto } from 'transaction-categories/dtos/find-all-transaction-categories.dto';

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
    const { status: newStatus } = editTransactionCategoryDto;

    const isStatusChanging =
        newStatus !== status && newStatus === ETransactionCategoryStatus.ACTIVE;

    if (!isStatusChanging) {
        return order;
    }

    if (!user) {
        throw new InternalServerErrorException('Old TransactionCategory has no User');
    }

    const transactionCategoriesByOldType = await findAllTransactionCategories({
        userId: user.id,
        type,
    });

    return transactionCategoriesByOldType.length;
};
