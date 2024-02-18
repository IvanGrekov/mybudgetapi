import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations, DataSource } from 'typeorm';

import { Account } from '../shared/entities/account.entity';
import { EAccountStatus, EAccountType } from '../shared/enums/accounts.enums';
import { UsersService } from '../users/users.service';

import {
  FindAllAccountsDto,
  CreateAccountDto,
  EditAccountDto,
  ReorderAccountDto,
} from './accounts.dto';
import { MAX_ACCOUNTS_PER_USER } from './accounts.constants';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll({
    userId,
    type,
    status,
  }: FindAllAccountsDto): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId }, type, status },
      order: { order: 'ASC' },
    });
  }

  async findOne(
    id: Account['id'],
    relations?: FindOptionsRelations<Account>,
  ): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations,
    });

    if (!account) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    return account;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    this.validateAccountProperties(createAccountDto);

    const { userId, balance, type } = createAccountDto;
    const user = await this.usersService.findOne(userId);
    const activeAccounts = await this.findAll({
      userId,
      status: EAccountStatus.ACTIVE,
    });

    if (activeAccounts.length >= MAX_ACCOUNTS_PER_USER) {
      throw new ForbiddenException(
        `User #${userId} already has the maximum number of accounts: ${MAX_ACCOUNTS_PER_USER}`,
      );
    }

    const order = this.getNewAccountNewOrder(activeAccounts, type);

    const accountTemplate = this.accountRepository.create({
      ...createAccountDto,
      initBalance: balance,
      order,
      user,
    });

    const account = await this.accountRepository.save(accountTemplate);

    return this.findOne(account.id);
  }

  async edit(
    id: Account['id'],
    editAccountDto: EditAccountDto,
  ): Promise<Account> {
    const oldAccount = await this.findOne(id, { user: true });
    if (!oldAccount) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    const { currency, balance, initBalance } = oldAccount;

    this.validateAccountCurrencyEditing({
      oldCurrency: currency,
      ...editAccountDto,
    });

    const { rate = 1 } = editAccountDto;
    const order = await this.getOldAccountNewOrder(oldAccount, editAccountDto);
    const account = await this.accountRepository.preload({
      id,
      ...editAccountDto,
      order,
      balance: balance * rate,
      initBalance: initBalance * rate,
    });

    this.validateAccountProperties(account);

    return this.accountRepository.save(account);
  }

  async reorder(
    id: Account['id'],
    { order }: ReorderAccountDto,
  ): Promise<Account[]> {
    const account = await this.findOne(id, { user: true });

    if (account.status === EAccountStatus.ARCHIVED) {
      throw new BadRequestException(`Account #${id} is archived`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { user, type } = account;
      const accountsByType = await this.findAll({
        userId: user.id,
        type,
        status: EAccountStatus.ACTIVE,
      });
      const newAccounts = accountsByType.filter(
        ({ id: accountId }) => accountId !== id,
      );
      newAccounts.splice(order, 0, account);
      newAccounts.forEach(({ id: accountId }, i) => {
        queryRunner.manager.update(Account, accountId, { order: i });
      });

      await queryRunner.commitTransaction();

      return this.findAll({
        userId: user.id,
        type,
        status: EAccountStatus.ACTIVE,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: Account['id']): Promise<Account> {
    const account = await this.findOne(id);

    return this.accountRepository.remove(account);
  }

  validateAccountProperties({
    type,
    shouldShowAsIncome,
    shouldShowAsExpense,
  }: {
    type?: EAccountType;
    shouldShowAsIncome?: boolean;
    shouldShowAsExpense?: boolean;
  }): void {
    if (shouldShowAsExpense && type !== EAccountType.I_OWE) {
      throw new BadRequestException(
        `Only 'i_owe' accounts can have 'shouldShowAsExpense'`,
      );
    }

    if (shouldShowAsIncome && type !== EAccountType.OWE_ME) {
      throw new BadRequestException(
        `Only 'owe_me' accounts can have 'shouldShowAsIncome'`,
      );
    }
  }

  validateAccountCurrencyEditing({
    oldCurrency,
    currency,
    rate,
  }: {
    oldCurrency: Account['currency'];
    currency?: Account['currency'];
    rate?: number;
  }): void {
    if (!currency) {
      return;
    }

    if (oldCurrency === currency) {
      throw new BadRequestException(
        `The new currency is the same as the old one: ${oldCurrency}`,
      );
    }

    if (typeof rate === 'undefined') {
      throw new BadRequestException('Rate is required for currency change');
    }
  }

  getNewAccountNewOrder(activeAccounts: Account[], type: EAccountType): number {
    const filteredAccounts = activeAccounts.filter(
      (account) => account.type === type,
    );

    return filteredAccounts.length;
  }

  async getOldAccountNewOrder(
    oldAccount: Account,
    editAccountDto: EditAccountDto,
  ): Promise<number> {
    const { user, order } = oldAccount;
    const { type: newType } = editAccountDto;

    if (typeof newType === 'undefined') {
      return order;
    }

    if (!user) {
      throw new InternalServerErrorException('Old account has no user');
    }

    const accountsByType = await this.findAll({
      userId: user.id,
      type: newType,
      status: EAccountStatus.ACTIVE,
    });

    return accountsByType.length;
  }
}
