import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  Repository,
  DataSource,
  Not,
  FindOptionsWhere,
} from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { ETransactionCategoryStatus } from '../shared/enums/transaction-categories.enums';
import { UsersService } from '../users/users.service';

import {
  FindAllTransactionCategoriesDto,
  CreateTransactionCategoryDto,
  EditTransactionCategoryDto,
  EditTransactionCategoryCurrencyDto,
  ReorderTransactionCategoriesDto,
  GetParentForNewTransactionCategoryDto,
  ArchiveTransactionCategoryDto,
  SyncTransactionCategoriesOrderDto,
  UnassignChildrenFromParentDto,
} from './transaction-categories.dto';
import { MAX_TRANSACTION_CATEGORIES_PER_USER } from './transaction-categories.constants';

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

    const transactionCategories = await this.transactionCategoryRepository.find(
      {
        where,
        order: { type: 'ASC', order: 'ASC' },
        relations: {
          parent: true,
          children: true,
        },
      },
    );

    const filteredTransactionCategories = parentId
      ? transactionCategories
      : this.filterChildTransactionCategories(transactionCategories);

    return this.sortChildTransactionCategories(filteredTransactionCategories);
  }

  async findOne(
    id: TransactionCategory['id'],
    relations?: FindOptionsRelations<TransactionCategory>,
  ): Promise<TransactionCategory> {
    const transactionCategory =
      await this.transactionCategoryRepository.findOne({
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

    if (
      activeTransactionCategories.length >= MAX_TRANSACTION_CATEGORIES_PER_USER
    ) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of TransactionCategories`,
      );
    }

    const transactionCategoryTemplate =
      this.transactionCategoryRepository.create({
        ...createTransactionCategoryDto,
        user,
      });

    transactionCategoryTemplate.parent =
      await this.getParentForNewTransactionCategory({
        parentId,
        userId,
        type,
      });

    transactionCategoryTemplate.order =
      await this.getNewTransactionCategoryNewOrder(
        transactionCategoryTemplate,
        activeTransactionCategories,
      );

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

    const order = await this.getOldTransactionCategoryNewOrder(
      oldTransactionCategory,
      editTransactionCategoryDto,
    );

    const transactionCategory =
      await this.transactionCategoryRepository.preload({
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
      return this.archiveTransactionCategory({
        userId: user.id,
        transactionCategory,
        oldTransactionCategory,
      });
    } else {
      return this.transactionCategoryRepository.save(transactionCategory);
    }
  }

  async editCurrency(
    id: TransactionCategory['id'],
    { currency }: EditTransactionCategoryCurrencyDto,
  ) {
    const oldTransactionCategory = await this.findOne(id);
    const oldCurrency = oldTransactionCategory.currency;

    if (oldCurrency === currency) {
      throw new BadRequestException(
        'The new `currency` is the same like current',
      );
    }

    const transactionCategory =
      await this.transactionCategoryRepository.preload({
        id,
        currency,
      });

    return this.transactionCategoryRepository.save(transactionCategory);
  }

  async reorder(
    reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto,
  ) {
    reorderTransactionCategoriesDto;
    // forbid to have children if item can not be as a parent
    // check length of children
    // prevent id duplicates
    return [];
  }

  async delete(id: TransactionCategory['id']): Promise<TransactionCategory> {
    const transactionCategory = await this.findOne(id);

    return this.transactionCategoryRepository.remove(transactionCategory);
  }

  private filterChildTransactionCategories(
    transactionCategories: TransactionCategory[],
  ): TransactionCategory[] {
    return transactionCategories.filter(({ parent }) => !parent);
  }

  private sortChildTransactionCategories(
    transactionCategories: TransactionCategory[],
  ): TransactionCategory[] {
    return transactionCategories.map((transactionCategory) => {
      const { children } = transactionCategory;

      if (Array.isArray(children)) {
        transactionCategory.children = children.sort(
          (a, b) => a.order - b.order,
        );
      }

      return transactionCategory;
    });
  }

  private async getParentForNewTransactionCategory({
    parentId,
    userId,
    type,
  }: GetParentForNewTransactionCategoryDto): Promise<
    TransactionCategory['parent']
  > {
    const parentTransactionCategory = await this.findOne(parentId, {
      user: true,
    });
    const { user: parentUser, type: parentType } = parentTransactionCategory;

    if (userId !== parentUser.id) {
      throw new ConflictException(
        'Parent TransactionCategory #${parentId} belongs to another User',
      );
    }

    if (type !== parentType) {
      throw new ConflictException(
        `Parent TransactionCategory #${parentId} \`type\` is different from the new TransactionCategory \`type\``,
      );
    }

    return parentTransactionCategory;
  }

  private async getNewTransactionCategoryNewOrder(
    transactionCategoryTemplate: TransactionCategory,
    activeTransactionCategories: TransactionCategory[],
  ): Promise<number> {
    const { parent, type } = transactionCategoryTemplate;

    if (parent) {
      const parentTransactionCategory = await this.findOne(parent.id, {
        children: true,
      });

      return parentTransactionCategory.children.length;
    }

    const filteredTransactionCategories = activeTransactionCategories.filter(
      (transactionCategory) => transactionCategory.type === type,
    );

    return filteredTransactionCategories.length;
  }

  private async getOldTransactionCategoryNewOrder(
    oldTransactionCategory: TransactionCategory,
    editTransactionCategoryDto: EditTransactionCategoryDto,
  ): Promise<number> {
    const { status, type, user, order } = oldTransactionCategory;
    const { status: newStatus, type: newType } = editTransactionCategoryDto;

    const isTypeChanging = typeof newType !== 'undefined' && newType !== type;
    const isStatusChanging =
      newStatus !== status && newStatus === ETransactionCategoryStatus.ACTIVE;

    if (!isTypeChanging && !isStatusChanging) {
      return order;
    }

    if (!user) {
      throw new InternalServerErrorException(
        'Old TransactionCategory has no User',
      );
    }

    if (isTypeChanging) {
      const transactionCategoriesByType = await this.findAll({
        userId: user.id,
        type: newType,
      });

      return transactionCategoriesByType.length;
    }

    const transactionCategoriesByOldType = await this.findAll({
      userId: user.id,
      type,
    });

    return transactionCategoriesByOldType.length;
  }

  private async archiveTransactionCategory({
    userId,
    transactionCategory,
    oldTransactionCategory,
  }: ArchiveTransactionCategoryDto): Promise<TransactionCategory> {
    const { parent, children, type } = oldTransactionCategory;
    const transactionCategoryId = transactionCategory.id;

    if (!Array.isArray(children)) {
      throw new InternalServerErrorException(
        'Old TransactionCategory has no resolved children',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (parent) {
        transactionCategory.parent = null;
      }

      if (children.length) {
        await this.unassignChildrenFromParent({
          queryRunner,
          userId,
          children,
        });
      }

      queryRunner.manager.update(
        TransactionCategory,
        transactionCategoryId,
        transactionCategory,
      );

      await this.syncTransactionCategoriesOrder({
        queryRunner,
        userId,
        excludeId: transactionCategoryId,
        type,
        parentId: parent?.id,
      });

      await queryRunner.commitTransaction();

      return this.findOne(transactionCategoryId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async syncTransactionCategoriesOrder({
    queryRunner,
    userId,
    type,
    excludeId,
    parentId,
  }: SyncTransactionCategoriesOrderDto): Promise<void> {
    const transactionCategories = await this.findAll({
      userId,
      type,
      excludeId,
      parentId,
    });

    transactionCategories.forEach(({ id }, i) => {
      queryRunner.manager.update(TransactionCategory, id, { order: i });
    });
  }

  private async unassignChildrenFromParent({
    queryRunner,
    userId,
    children,
  }: UnassignChildrenFromParentDto): Promise<void> {
    if (!Array.isArray(children)) {
      throw new InternalServerErrorException(
        'TransactionCategory children not resolved',
      );
    }

    if (children.length === 0) {
      return;
    }

    const transactionCategoriesByType = await this.findAll({
      userId,
      type: children[0].type,
    });
    const length = transactionCategoriesByType.length - 1;

    children.forEach(({ id }, i) => {
      const newOrder = length + i;
      queryRunner.manager.update(TransactionCategory, id, {
        order: newOrder,
        parent: null,
      });
    });
  }
}
