import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, FindOptionsWhere } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import MaximumEntitiesNumberException from '../shared/exceptions/maximum-entities-number.exception';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { Transaction } from '../shared/entities/transaction.entity';
import { ETransactionCategoryStatus } from '../shared/enums/transaction-category.enums';
import { validateUserOwnership } from '../shared/utils/validateUserOwnership';

import { UsersService } from '../users/users.service';

import { FindAllTransactionCategoriesDto } from './dtos/find-all-transaction-categories.dto';
import { CreateTransactionCategoryDto } from './dtos/create-transaction-category.dto';
import { MAX_TRANSACTION_CATEGORIES_PER_USER } from './constants/transaction-categories-pagination.constants';
import { getParentTransactionCategories } from './utils/getParentTransactionCategories.util';
import { sortChildTransactionCategories } from './utils/sortChildTransactionCategories.util';
import { getParentForNewTransactionCategory } from './utils/getParentForNewTransactionCategory.util';
import { getNewTransactionCategoryOrder } from './utils/getNewTransactionCategoryOrder.utils';
import { getOldTransactionCategoryNewOrder } from './utils/getOldTransactionCategoryNewOrder.utils';
import { archiveTransactionCategory } from './utils/archiveTransactionCategory.utils';
import { validateReorderingTransactionCategories } from './utils/validateReorderingTransactionCategories.util';
import { updateReorderingParent } from './utils/updateReorderingParent.utils';
import { extractChildrenTransactionCategories } from './utils/extractChildrenTransactionCategories';
import { IGetOneTransactionCategoryArgs } from './interfaces/get-one-transaction-category-args.interface';
import { IEditTransactionCategoryArgs } from './interfaces/edit-transaction-category-args.interface';
import { IEditTransactionCategoryCurrencyArgs } from './interfaces/edit-transaction-category-currency-args.interface';
import { IReorderTransactionCategoriesArgs } from './interfaces/reorder-transaction-categories-args.interface';
import { IDeleteTransactionCategoryArgs } from './interfaces/delete-transaction-category-args.interface';

@Injectable()
export class TransactionCategoriesService {
    constructor(
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
    ) {}

    async findAll({
        userId,
        type,
        status = ETransactionCategoryStatus.ACTIVE,
        excludeId,
        parentId,
        shouldFilterChildTransactionCategories = true,
    }: FindAllTransactionCategoriesDto): Promise<TransactionCategory[]> {
        const where: FindOptionsWhere<TransactionCategory> = {
            id: typeof excludeId === 'number' ? Not(excludeId) : undefined,
            user: { id: userId },
            type,
            status,
        };

        const isParentIdProvided = typeof parentId !== 'undefined';

        if (isParentIdProvided) {
            where.parent = { id: parentId };
        }

        const transactionCategories = await this.transactionCategoryRepository.find({
            where,
            order: { type: 'ASC', order: 'ASC' },
            relations: {
                parent: true,
                children: true,
            },
        });

        const filteredTransactionCategories =
            isParentIdProvided || !shouldFilterChildTransactionCategories
                ? transactionCategories
                : getParentTransactionCategories(transactionCategories);

        return sortChildTransactionCategories(filteredTransactionCategories);
    }

    async getOne({
        id,
        activeUserId,
        relations,
    }: IGetOneTransactionCategoryArgs): Promise<TransactionCategory> {
        const transactionCategory = await this.transactionCategoryRepository.findOne({
            where: { id },
            relations: {
                user: true,
                ...relations,
            },
        });

        validateUserOwnership({
            activeUserId,
            entity: transactionCategory,
        });

        if (!transactionCategory) {
            throw new NotFoundException('TransactionCategory', id);
        }

        return transactionCategory;
    }

    async create(
        createTransactionCategoryDto: CreateTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        const { userId, parentId, type } = createTransactionCategoryDto;

        const user = await this.usersService.getOne(userId);
        const activeTransactionCategories = await this.findAll({
            userId,
            shouldFilterChildTransactionCategories: false,
        });

        if (activeTransactionCategories.length >= MAX_TRANSACTION_CATEGORIES_PER_USER) {
            throw new MaximumEntitiesNumberException(user.id, 'TransactionCategory');
        }

        const transactionCategoryTemplate = this.transactionCategoryRepository.create({
            ...createTransactionCategoryDto,
            user,
        });

        transactionCategoryTemplate.parent = await getParentForNewTransactionCategory({
            parentId,
            userId,
            type,
            getOneTransactionCategory: this.getOne.bind(this),
        });

        transactionCategoryTemplate.order = await getNewTransactionCategoryOrder({
            transactionCategoryTemplate,
            activeTransactionCategories,
            getOneTransactionCategory: this.getOne.bind(this),
        });

        return this.transactionCategoryRepository.save(transactionCategoryTemplate);
    }

    async edit({
        id,
        activeUserId,
        editTransactionCategoryDto,
    }: IEditTransactionCategoryArgs): Promise<TransactionCategory> {
        const oldTransactionCategory = await this.getOne({
            id,
            activeUserId,
            relations: {
                parent: true,
                children: true,
            },
        });

        const order = await getOldTransactionCategoryNewOrder({
            oldTransactionCategory,
            editTransactionCategoryDto,
            findAllTransactionCategories: this.findAll.bind(this),
        });

        const transactionCategory = await this.transactionCategoryRepository.preload({
            id,
            ...editTransactionCategoryDto,
            order,
        });

        const { status, user } = oldTransactionCategory;
        const { status: newStatus } = editTransactionCategoryDto;
        const isArchiving =
            status !== newStatus && newStatus === ETransactionCategoryStatus.ARCHIVED;

        if (isArchiving) {
            return archiveTransactionCategory({
                userId: user.id,
                transactionCategory,
                oldTransactionCategory,
                createQueryRunner: this.dataSource.createQueryRunner.bind(this.dataSource),
                getOneTransactionCategory: this.getOne.bind(this),
                findAllTransactionCategories: this.findAll.bind(this),
            });
        } else {
            return this.transactionCategoryRepository.save(transactionCategory);
        }
    }

    async editCurrency({
        id,
        activeUserId,
        editTransactionCategoryCurrencyDto: { currency },
    }: IEditTransactionCategoryCurrencyArgs): Promise<TransactionCategory> {
        const oldTransactionCategory = await this.getOne({
            id,
            activeUserId,
        });
        const oldCurrency = oldTransactionCategory.currency;
        if (oldCurrency === currency) {
            throw new BadRequestException('The new `currency` is the same like current one');
        }

        const relatedTransactions = await this.transactionRepository.count({
            take: 1,
            where: {
                fromCategory: { id },
                toCategory: { id },
            },
        });
        if (relatedTransactions) {
            throw new BadRequestException(
                'The TransactionCategory already has related Transactions',
            );
        }

        const transactionCategory = await this.transactionCategoryRepository.preload({
            id,
            currency,
        });

        return this.transactionCategoryRepository.save(transactionCategory);
    }

    async reorder({
        activeUserId,
        reorderTransactionCategoriesDto: { parentNodes },
    }: IReorderTransactionCategoriesArgs): Promise<TransactionCategory[]> {
        if (parentNodes.length === 0) {
            throw new BadRequestException('Items for reordering not provided');
        }

        const {
            user: { id: userId },
            type,
        } = await this.getOne({ id: parentNodes.at(0).id, activeUserId });
        const currentTransactionCategories = await this.findAll({
            userId,
            type,
            shouldFilterChildTransactionCategories: false,
        });

        validateReorderingTransactionCategories(parentNodes, currentTransactionCategories);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const parentNode of parentNodes) {
                await updateReorderingParent({
                    parentNode,
                    getOneTransactionCategory: this.getOne.bind(this),
                    updateTransactionCategory: (id, transactionCategory) =>
                        queryRunner.manager.update(TransactionCategory, id, transactionCategory),
                });
            }

            await queryRunner.commitTransaction();

            return this.findAll({
                userId,
                type,
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async delete({
        id,
        activeUserId,
        deleteTransactionCategoryDto: { shouldRemoveChildTransactionCategories },
    }: IDeleteTransactionCategoryArgs): Promise<TransactionCategory[]> {
        const transactionCategory = await this.getOne({
            id,
            activeUserId,
            relations: {
                user: true,
                parent: true,
                children: true,
            },
        });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const {
                children,
                parent,
                type,
                user: { id: userId },
            } = transactionCategory;

            const siblingsTransactionCategories = await this.findAll({
                userId,
                type,
                parentId: parent?.id,
                excludeId: id,
            });

            if (shouldRemoveChildTransactionCategories && !!children?.length) {
                extractChildrenTransactionCategories({
                    children,
                    currentParentsLength: siblingsTransactionCategories.length,
                    updateTransactionCategory: (id, transactionCategory) =>
                        queryRunner.manager.update(TransactionCategory, id, transactionCategory),
                });
            }

            siblingsTransactionCategories.forEach(({ id: transactionCategoryId }, i) => {
                queryRunner.manager.update(TransactionCategory, transactionCategoryId, {
                    order: i,
                });
            });

            queryRunner.manager.remove(transactionCategory);

            await queryRunner.commitTransaction();

            return this.findAll({
                userId,
                type,
            });
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
