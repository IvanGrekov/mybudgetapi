import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';

import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionCategory } from './entities/transaction-category.entity';
import { getDefaultAccountsDto } from './utils/account.utils';
import { getDefaultTransactionCategoriesDto } from './utils/transaction-category.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { PreloadAccountDto } from './dto/preload-account.dto';
import { PreloadTransactionCategoryDto } from './dto/preload-transaction-category.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepository: Repository<TransactionCategory>,
  ) {}

  async findAll({ limit, offset }: PaginationQueryDto): Promise<User[]> {
    const users = await this.userRepository.find({
      take: limit,
      skip: (offset - 1) * limit,
      relations: {
        accounts: true,
        transactionCategories: {
          parent: true,
          children: true,
        },
      },
    });

    return users.map(this.filterTransactionCategories);
  }

  async findOne(id: User['id']): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        accounts: true,
        transactionCategories: {
          parent: true,
          children: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.filterTransactionCategories(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const accounts = getDefaultAccountsDto(createUserDto.defaultCurrency).map(
      (accountDto) => this.preloadAccount(accountDto),
    );
    const transactionCategories = getDefaultTransactionCategoriesDto(
      createUserDto.defaultCurrency,
    ).map((transactionCategory) =>
      this.preloadTransactionCategory(transactionCategory),
    );

    const user = this.userRepository.create({
      ...createUserDto,
      accounts,
      transactionCategories,
    });

    return this.userRepository.save(user);
  }

  async edit(id: User['id'], editUserDto: EditUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...editUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async delete(id: User['id']): Promise<User> {
    const user = await this.findOne(id);

    return this.userRepository.remove(user);
  }

  preloadAccount(preloadAccountDto: PreloadAccountDto): Account {
    return this.accountRepository.create(preloadAccountDto);
  }

  preloadTransactionCategory(
    preloadTransactionCategoryDto: PreloadTransactionCategoryDto,
  ): TransactionCategory {
    return this.transactionCategoryRepository.create(
      preloadTransactionCategoryDto,
    );
  }

  filterTransactionCategories(user: User): User {
    const { transactionCategories } = user;
    const transactionCategoriesWithoutChildren = transactionCategories.filter(
      ({ parent }) => !parent,
    );

    return {
      ...user,
      transactionCategories: transactionCategoriesWithoutChildren,
    };
  }
}
