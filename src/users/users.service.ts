import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  QueryRunner,
  Repository,
} from 'typeorm';

import { User } from '../shared/entities/user.entity';
import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';
import { getDefaultAccountsDto } from '../shared/utils/accounts.utils';
import { getDefaultTransactionCategoriesDto } from '../shared/utils/transaction-categories.utils';
import { ECurrency } from '../shared/enums/currency.enums';

import { CreateUserDto, EditUserDto, EditUserCurrencyDto } from './users.dto';

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
    return this.userRepository.find({
      take: limit,
      skip: (offset - 1) * limit,
    });
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
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
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

    const userTemplate = this.userRepository.create({
      ...createUserDto,
      accounts,
      transactionCategories,
    });
    const user = await this.userRepository.save(userTemplate);

    return this.findOne(user.id);
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
      rate,
    }: EditUserCurrencyDto,
  ): Promise<User> {
    if (isForceCurrencyUpdate && isSoftCurrencyUpdate) {
      throw new BadRequestException(
        'isForceCurrencyUpdate and isSoftCurrencyUpdate cannot be true at the same time',
      );
    }

    if (!isForceCurrencyUpdate && !isSoftCurrencyUpdate) {
      throw new BadRequestException(
        'isForceCurrencyUpdate or isSoftCurrencyUpdate must be true',
      );
    }

    const oldUser = await this.findOne(id);
    const oldDefaultCurrency = oldUser.defaultCurrency;

    if (oldDefaultCurrency === defaultCurrency) {
      throw new BadRequestException(
        `The new currency is the same as the old one: ${defaultCurrency}`,
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

  updateRelationsCurrency({
    queryRunner,
    userId,
    isForceCurrencyUpdate,
    currency,
    oldCurrency,
    rate,
  }: {
    queryRunner: QueryRunner;
    userId: User['id'];
    currency: ECurrency;
    oldCurrency: ECurrency;
    rate: number;
    isForceCurrencyUpdate: boolean;
  }): void {
    const calculateBalance = () => `balance * ${rate}`;
    const calculateInitBalance = () => `initBalance * ${rate}`;

    if (isForceCurrencyUpdate) {
      queryRunner.manager.update(
        Account,
        { user: { id: userId } },
        {
          currency,
          balance: calculateBalance,
          initBalance: calculateInitBalance,
        },
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
        {
          currency,
          balance: calculateBalance,
          initBalance: calculateInitBalance,
        },
      );

      queryRunner.manager.update(
        TransactionCategory,
        { user: { id: userId }, currency: oldCurrency },
        { currency },
      );
    }
  }

  preloadAccount(preloadAccountDto: PreloadAccountDto): Account {
    return this.accountRepository.create({
      ...preloadAccountDto,
      initBalance: preloadAccountDto.balance,
    });
  }

  preloadTransactionCategory(
    preloadTransactionCategoryDto: PreloadTransactionCategoryDto,
  ): TransactionCategory {
    return this.transactionCategoryRepository.create(
      preloadTransactionCategoryDto,
    );
  }
}
