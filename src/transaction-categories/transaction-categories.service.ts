import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository, DataSource, Not, FindOptionsWhere } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import MaximumEntitiesNumberException from '../shared/exceptions/maximum-entities-number.exception';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { ETransactionCategoryStatus } from '../shared/enums/transaction-category.enums';
import { UsersService } from '../users/users.service';

import { FindAllTransactionCategoriesDto } from './dtos/find-all-transaction-categories.dto';
import { CreateTransactionCategoryDto } from './dtos/create-transaction-category.dto';
import { ReorderTransactionCategoriesDto } from './dtos/reorder-transaction-categories.dto';
import { EditTransactionCategoryDto } from './dtos/edit-transaction-category.dto';
import { EditTransactionCategoryCurrencyDto } from './dtos/edit-transaction-category-currency.dto';
import { MAX_TRANSACTION_CATEGORIES_PER_USER } from './constants/transaction-categories-pagination.constants';
import { getParentTransactionCategories } from './utils/getParentTransactionCategories.util';
import { sortChildTransactionCategories } from './utils/sortChildTransactionCategories.util';
import { getParentForNewTransactionCategory } from './utils/getParentForNewTransactionCategory.util';
import { getNewTransactionCategoryOrder } from './utils/getNewTransactionCategoryOrder.utils';
import { getOldTransactionCategoryNewOrder } from './utils/getOldTransactionCategoryNewOrder.utils';
import { archiveTransactionCategory } from './utils/archiveTransactionCategory.utils';
import { validateReorderingTransactionCategories } from './utils/validateReorderingTransactionCategories.util';
import { updateReorderingParent } from './utils/updateReorderingParent.utils';

@Injectable()
export class TransactionCategoriesService {
    constructor(
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
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
            user: { id: userId },
            type,
            status,
        };

        if (typeof excludeId !== 'undefined') {
            where.id = Not(excludeId);
        }

        if (typeof parentId !== 'undefined') {
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
            parentId || !shouldFilterChildTransactionCategories
                ? transactionCategories
                : getParentTransactionCategories(transactionCategories);

        return sortChildTransactionCategories(filteredTransactionCategories);
    }

    async findOne(
        id: TransactionCategory['id'],
        relations?: FindOptionsRelations<TransactionCategory>,
    ): Promise<TransactionCategory> {
        const transactionCategory = await this.transactionCategoryRepository.findOne({
            where: { id },
            relations,
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

        const user = await this.usersService.findOne(userId);
        const activeTransactionCategories = await this.findAll({
            userId,
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
            findOneTransactionCategory: this.findOne.bind(this),
        });

        transactionCategoryTemplate.order = await getNewTransactionCategoryOrder({
            transactionCategoryTemplate,
            activeTransactionCategories,
            findOneTransactionCategory: this.findOne.bind(this),
        });

        const transactionCategory = await this.transactionCategoryRepository.save(
            transactionCategoryTemplate,
        );

        return this.findOne(transactionCategory.id, { parent: true });
    }

    async edit(
        id: TransactionCategory['id'],
        editTransactionCategoryDto: EditTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        const oldTransactionCategory = await this.findOne(id, {
            user: true,
            parent: true,
            children: true,
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

        const { status, type, user } = oldTransactionCategory;
        const { status: newStatus, type: newType } = editTransactionCategoryDto;
        const isTypeChanging = typeof newType !== 'undefined' && newType !== type;
        const isArchiving =
            status !== newStatus && newStatus === ETransactionCategoryStatus.ARCHIVED;

        if (isTypeChanging) {
            transactionCategory.parent = null;
            transactionCategory.children = [];
        }

        if (isArchiving) {
            return archiveTransactionCategory({
                userId: user.id,
                transactionCategory,
                oldTransactionCategory,
                createQueryRunner: this.dataSource.createQueryRunner.bind(this.dataSource),
                findOneTransactionCategory: this.findOne.bind(this),
                findAllTransactionCategories: this.findAll.bind(this),
            });
        } else {
            return this.transactionCategoryRepository.save(transactionCategory);
        }
    }

    async editCurrency(
        id: TransactionCategory['id'],
        { currency }: EditTransactionCategoryCurrencyDto,
    ): Promise<TransactionCategory> {
        const oldTransactionCategory = await this.findOne(id);
        const oldCurrency = oldTransactionCategory.currency;

        if (oldCurrency === currency) {
            throw new BadRequestException('The new `currency` is the same like current one');
        }

        const transactionCategory = await this.transactionCategoryRepository.preload({
            id,
            currency,
        });

        return this.transactionCategoryRepository.save(transactionCategory);
    }

    async reorder({ parentNodes }: ReorderTransactionCategoriesDto) {
        if (parentNodes.length === 0) {
            throw new BadRequestException('Items for reordering not provided');
        }

        const {
            user: { id: userId },
            type,
        } = await this.findOne(parentNodes.at(0).id, {
            user: true,
        });
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
                    findOneTransactionCategory: this.findOne.bind(this),
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

    async delete(id: TransactionCategory['id']): Promise<TransactionCategory> {
        const transactionCategory = await this.findOne(id);

        return this.transactionCategoryRepository.remove(transactionCategory);
    }
}
