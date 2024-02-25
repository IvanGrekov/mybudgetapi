import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { User } from '../shared/entities/user.entity';
import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';
import { calculateSkipOption } from '../shared/utils/pagination.utils';
import {
  getDefaultAccountsDto,
  getCalculateNewAccountBalance,
} from '../shared/utils/accounts.utils';
import { getDefaultTransactionCategoriesDto } from '../shared/utils/transaction-categories.utils';

import {
  CreateUserDto,
  EditUserDto,
  EditUserCurrencyDto,
  UpdateRelationsCurrencyDto,
} from './users.dto';

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

  async findAll(query: PaginationQueryDto): Promise<User[]> {
    return this.userRepository.find({
      take: query.limit,
      skip: calculateSkipOption(query),
    });
  }

  async getNewName(): Promise<string> {
    return this.userRepository.count().then((count) => `User#${count + 1}`);
  }

  async findOne(
    id: User['id'],
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { defaultCurrency: currency, language } = createUserDto;

    const accounts = getDefaultAccountsDto({
      currency,
      language,
    }).map((accountDto) => this.preloadAccount(accountDto));

    const transactionCategories = getDefaultTransactionCategoriesDto({
      currency,
      language,
    }).map((transactionCategory) =>
      this.preloadTransactionCategory(transactionCategory),
    );

    const userTemplate = this.userRepository.create({
      ...createUserDto,
      accounts,
      transactionCategories,
    });

    // TODO: assign user to child transactionCategories

    console.log('transactionCategories', transactionCategories);
    console.log('------------');
    console.log('userTemplate', userTemplate);

    const user = await this.userRepository.save(userTemplate);

    return this.findOne(user.id);
  }

  async edit(id: User['id'], editUserDto: EditUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      ...editUserDto,
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    return this.userRepository.save(user);
  }

  async editCurrency(
    id: User['id'],
    { defaultCurrency, rate, isForceCurrencyUpdate }: EditUserCurrencyDto,
  ): Promise<User> {
    const oldUser = await this.findOne(id);
    const oldDefaultCurrency = oldUser.defaultCurrency;

    if (oldDefaultCurrency === defaultCurrency) {
      throw new BadRequestException(
        'The new `defaultCurrency` is the same like current',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      queryRunner.manager.update(User, id, { defaultCurrency });

      this.updateRelationsCurrency({
        queryRunner,
        userId: id,
        isForceCurrencyUpdate,
        oldCurrency: oldDefaultCurrency,
        currency: defaultCurrency,
        rate,
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

  private preloadAccount(preloadAccountDto: PreloadAccountDto): Account {
    return this.accountRepository.create({
      ...preloadAccountDto,
      initBalance: preloadAccountDto.balance,
    });
  }

  private preloadTransactionCategory(
    preloadTransactionCategoryDto: PreloadTransactionCategoryDto,
  ): TransactionCategory {
    return this.transactionCategoryRepository.create(
      preloadTransactionCategoryDto,
    );
  }

  private updateRelationsCurrency({
    queryRunner,
    userId,
    isForceCurrencyUpdate,
    currency,
    oldCurrency,
    rate,
  }: UpdateRelationsCurrencyDto): void {
    const criteria = isForceCurrencyUpdate
      ? { user: { id: userId } }
      : { user: { id: userId }, currency: oldCurrency };

    const accountPartialEntity = {
      currency,
      balance: getCalculateNewAccountBalance(rate),
      initBalance: getCalculateNewAccountBalance(rate, true),
    };

    const transactionCategoryPartialEntity = {
      currency,
    };

    if (isForceCurrencyUpdate) {
      queryRunner.manager.update(Account, criteria, accountPartialEntity);
      queryRunner.manager.update(
        TransactionCategory,
        criteria,
        transactionCategoryPartialEntity,
      );
    } else {
      queryRunner.manager.update(Account, criteria, accountPartialEntity);
      queryRunner.manager.update(
        TransactionCategory,
        criteria,
        transactionCategoryPartialEntity,
      );
    }
  }
}
