import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';

import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionCategory } from './entities/transaction-category.entity';
import { getDefaultAccountsDto } from './utils/account.utils';
import { getDefaultTransactionCategoriesDto } from './utils/transaction-category.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { EditUserCurrencyDto } from './dto/edit-user-currency.dto';
import { PreloadAccountDto } from './dto/preload-account.dto';
import { PreloadTransactionCategoryDto } from './dto/preload-transaction-category.dto';
import { ECurrency } from './enums/currency.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepository: Repository<TransactionCategory>,
    private readonly dataSource: DataSource,
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
        transactionCategories: {
          parent: true,
          children: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    const accounts = await this.getUserAccounts(id);
    const overallBalance = accounts.reduce(
      (sum, { balance, shouldHideFromOverallBalance }) =>
        shouldHideFromOverallBalance ? sum : sum + balance,
      0,
    );

    return this.filterTransactionCategories({
      ...user,
      overallBalance,
      accounts,
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { defaultCurrency, language } = createUserDto;

    const accounts = getDefaultAccountsDto({
      currency: defaultCurrency,
      language,
    }).map((accountDto) => this.preloadAccount(accountDto));

    const transactionCategories = getDefaultTransactionCategoriesDto({
      currency: defaultCurrency,
      language,
    }).map((transactionCategory) =>
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

  async editUserCurrency(
    id: User['id'],
    {
      defaultCurrency,
      isForceCurrencyUpdate,
      isSoftCurrencyUpdate,
    }: EditUserCurrencyDto,
  ): Promise<User> {
    if (isForceCurrencyUpdate && isSoftCurrencyUpdate) {
      throw new BadRequestException(
        'isForceCurrencyUpdate and isSoftCurrencyUpdate cannot be true at the same time',
      );
    }

    const oldUser = await this.findOne(id);
    const oldDefaultCurrency = oldUser.defaultCurrency;

    if (oldDefaultCurrency === defaultCurrency) {
      throw new BadRequestException(
        `The new currency is the same as the old one: ${defaultCurrency}`,
      );
    }

    if (!isForceCurrencyUpdate && !isSoftCurrencyUpdate) {
      const user = await this.userRepository.preload({
        id,
        defaultCurrency,
      });

      return this.userRepository.save(user);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      queryRunner.manager.update(User, id, { defaultCurrency });
      this.updateRelationsCurrency({
        queryRunner,
        userId: id,
        oldCurrency: oldDefaultCurrency,
        currency: defaultCurrency,
        isForceCurrencyUpdate,
      });

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: User['id']): Promise<User> {
    const user = await this.findOne(id);

    return this.userRepository.remove(user);
  }

  async getUserAccounts(id: User['id']): Promise<Account[]> {
    return this.accountRepository.find({
      where: {
        user: { id },
      },
    });
  }

  updateRelationsCurrency({
    queryRunner,
    userId,
    currency,
    oldCurrency,
    isForceCurrencyUpdate,
  }: {
    queryRunner: QueryRunner;
    userId: User['id'];
    currency: ECurrency;
    oldCurrency: ECurrency;
    isForceCurrencyUpdate: boolean;
  }): void {
    if (isForceCurrencyUpdate) {
      queryRunner.manager.update(
        Account,
        { user: { id: userId } },
        { currency },
      );
      queryRunner.manager.update(
        TransactionCategory,
        { user: { id: userId } },
        { currency },
      );
    } else {
      queryRunner.manager.update(
        Account,
        { user: { id: userId }, currency: oldCurrency },
        { currency },
      );
      queryRunner.manager.update(
        TransactionCategory,
        { user: { id: userId }, currency: oldCurrency },
        { currency },
      );
    }
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
