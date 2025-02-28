import { InternalServerErrorException } from '@nestjs/common';
import { QueryRunner, UpdateResult } from 'typeorm';

import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { ETransactionCategoryType } from 'shared/enums/transaction-category.enums';

import { FindAllTransactionCategoriesDto } from 'transaction-categories/dtos/find-all-transaction-categories.dto';

type TSyncTransactionCategoriesOrder = (args: {
    userId: number;
    type: ETransactionCategoryType;
    excludeId?: number;
    parentId?: number;
    findAllTransactionCategories(
        args: FindAllTransactionCategoriesDto,
    ): Promise<TransactionCategory[]>;
    updateTransactionCategory(
        id: number,
        transactionCategory: Partial<TransactionCategory>,
    ): Promise<UpdateResult>;
}) => Promise<void>;

type TUnassignChildrenFromParent = (args: {
    userId: number;
    children: TransactionCategory[];
    findAllTransactionCategories(
        args: FindAllTransactionCategoriesDto,
    ): Promise<TransactionCategory[]>;
    updateTransactionCategory(
        id: number,
        transactionCategory: Partial<TransactionCategory>,
    ): Promise<UpdateResult>;
}) => Promise<void>;

type TArchiveTransactionCategory = (args: {
    userId: number;
    transactionCategory: TransactionCategory;
    oldTransactionCategory: TransactionCategory;
    createQueryRunner(): QueryRunner;
    getOneTransactionCategory(id: number): Promise<TransactionCategory>;
    findAllTransactionCategories(
        args: FindAllTransactionCategoriesDto,
    ): Promise<TransactionCategory[]>;
}) => Promise<TransactionCategory>;

const syncTransactionCategoriesOrder: TSyncTransactionCategoriesOrder = async ({
    userId,
    type,
    excludeId,
    parentId,
    findAllTransactionCategories,
    updateTransactionCategory,
}) => {
    const transactionCategories = await findAllTransactionCategories({
        userId,
        type,
        excludeId,
        parentId,
    });

    transactionCategories.forEach(({ id }, i) => {
        updateTransactionCategory(id, { order: i });
    });
};

const unassignChildrenFromParent: TUnassignChildrenFromParent = async ({
    userId,
    children,
    findAllTransactionCategories,
    updateTransactionCategory,
}) => {
    if (!Array.isArray(children)) {
        throw new InternalServerErrorException('TransactionCategory children not resolved');
    }

    if (children.length === 0) {
        return;
    }

    const transactionCategoriesByType = await findAllTransactionCategories({
        userId,
        type: children[0].type,
    });
    const length = transactionCategoriesByType.length - 1;

    for (let i = 0; i < children.length; i++) {
        const newOrder = length + i;
        await updateTransactionCategory(children[i].id, {
            order: newOrder,
            parent: null,
        });
    }
};

export const archiveTransactionCategory: TArchiveTransactionCategory = async ({
    userId,
    transactionCategory,
    oldTransactionCategory,
    createQueryRunner,
    getOneTransactionCategory,
    findAllTransactionCategories,
}) => {
    const { parent, children, type } = oldTransactionCategory;
    const transactionCategoryId = transactionCategory.id;

    if (!Array.isArray(children)) {
        throw new InternalServerErrorException('TransactionCategory has no resolved children');
    }

    const queryRunner = createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        if (parent) {
            transactionCategory.parent = null;
        }

        const updateTransactionCategory = (
            id: number,
            transactionCategory: Partial<TransactionCategory>,
        ) => queryRunner.manager.update(TransactionCategory, id, transactionCategory);

        if (children.length) {
            await unassignChildrenFromParent({
                userId,
                children,
                findAllTransactionCategories,
                updateTransactionCategory,
            });
        }

        await updateTransactionCategory(transactionCategoryId, transactionCategory);

        await syncTransactionCategoriesOrder({
            userId,
            excludeId: transactionCategoryId,
            type,
            parentId: parent?.id,
            findAllTransactionCategories,
            updateTransactionCategory,
        });

        await queryRunner.commitTransaction();

        return getOneTransactionCategory(transactionCategoryId);
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};
