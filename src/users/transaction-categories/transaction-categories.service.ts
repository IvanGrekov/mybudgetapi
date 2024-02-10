import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';

import { TransactionCategory } from '../entities/transaction-category.entity';
import { CreateTransactionCategoryDto } from '../dto/create-transaction-category.dto';
import { EditTransactionCategoryDto } from '../dto/edit-transaction-category.dto';
import { UsersService } from '../users.service';
import { MAX_TRANSACTION_CATEGORIES_PER_USER } from '../constants/transaction-categories.constant';

@Injectable()
export class TransactionCategoriesService {
  constructor(
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepository: Repository<TransactionCategory>,
    private readonly usersService: UsersService,
  ) {}

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
    );

    if (
      user.transactionCategories.length >= MAX_TRANSACTION_CATEGORIES_PER_USER
    ) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of transaction categories`,
      );
    }

    const transactionCategory = this.transactionCategoryRepository.create({
      ...createTransactionCategoryDto,
      user: {
        ...user,
        accounts: undefined,
        transactionCategories: undefined,
      },
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

      if (parentUser.id !== user.id) {
        throw new ConflictException(
          `Parent Transaction Category #${parentId} does not belong to User #${user.id}`,
        );
      }

      transactionCategory.parent = {
        ...parentTransactionCategory,
        user: undefined,
      };
    }

    return this.transactionCategoryRepository.save(transactionCategory);
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
}
