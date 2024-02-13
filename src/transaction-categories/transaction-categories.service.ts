import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

import { TransactionCategory } from './transaction-category.entity';
import {
  CreateTransactionCategoryDto,
  EditTransactionCategoryDto,
} from './transaction-categories.dto';
import { MAX_TRANSACTION_CATEGORIES_PER_USER } from './transaction-categories.constants';

@Injectable()
export class TransactionCategoriesService {
  constructor(
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepository: Repository<TransactionCategory>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: User['id']): Promise<TransactionCategory[]> {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    const transactionCategories = await this.transactionCategoryRepository.find(
      {
        where: { user: { id: userId } },
        relations: {
          parent: true,
          children: true,
        },
      },
    );

    return this.filterChildTransactionCategories(transactionCategories);
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
      throw new NotFoundException(`Transaction Category #${id} not found`);
    }

    return transactionCategory;
  }

  async create(
    createTransactionCategoryDto: CreateTransactionCategoryDto,
  ): Promise<TransactionCategory> {
    const user = await this.usersService.findOne(
      createTransactionCategoryDto.userId,
      { transactionCategories: true },
    );

    if (
      user.transactionCategories.length >= MAX_TRANSACTION_CATEGORIES_PER_USER
    ) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of transaction categories`,
      );
    }

    const transactionCategoryTemplate =
      this.transactionCategoryRepository.create({
        ...createTransactionCategoryDto,
        user,
      });
    const { parentId, type } = createTransactionCategoryDto;

    if (typeof parentId === 'number') {
      const parentTransactionCategory = await this.findOne(parentId, {
        user: true,
      });
      const { type: parentType, user: parentUser } = parentTransactionCategory;

      if (type !== parentType) {
        throw new ConflictException(
          `Parent Transaction Category #${parentId} type is different from the new Transaction Category type`,
        );
      }

      if (user.id !== parentUser.id) {
        throw new ConflictException(
          `Parent Transaction Category #${parentId} does not belong to User #${user.id}`,
        );
      }

      transactionCategoryTemplate.parent = parentTransactionCategory;
    }

    const transactionCategory = await this.transactionCategoryRepository.save(
      transactionCategoryTemplate,
    );

    return this.findOne(transactionCategory.id, { parent: true });
  }

  async edit(
    id: TransactionCategory['id'],
    editTransactionCategoryDto: EditTransactionCategoryDto,
  ): Promise<TransactionCategory> {
    const transactionCategory =
      await this.transactionCategoryRepository.preload({
        id,
        ...editTransactionCategoryDto,
      });

    if (!transactionCategory) {
      throw new NotFoundException(`Transaction Category #${id} not found`);
    }

    return this.transactionCategoryRepository.save(transactionCategory);
  }

  async delete(id: TransactionCategory['id']): Promise<TransactionCategory> {
    const transactionCategory = await this.findOne(id);

    return this.transactionCategoryRepository.remove(transactionCategory);
  }

  filterChildTransactionCategories(
    transactionCategories: TransactionCategory[],
  ): TransactionCategory[] {
    return transactionCategories.filter(({ parent }) => !parent);
  }
}
