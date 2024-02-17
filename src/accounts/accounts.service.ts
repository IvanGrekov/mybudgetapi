import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from '../shared/entities/account.entity';
import { EAccountStatus, EAccountType } from '../shared/enums/accounts.enums';
import { UsersService } from '../users/users.service';

import {
  FindAllAccountsDto,
  CreateAccountDto,
  EditAccountDto,
} from './accounts.dto';
import { MAX_ACCOUNTS_PER_USER } from './accounts.constants';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly usersService: UsersService,
  ) {}

  async findAll({
    userId,
    type,
    status,
  }: FindAllAccountsDto): Promise<Account[]> {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    return this.accountRepository.find({
      where: { user: { id: userId }, type, status },
    });
  }

  async findOne(id: Account['id']): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    return account;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    this.validateAccountProperties(createAccountDto);

    const { userId, balance } = createAccountDto;
    const user = await this.usersService.findOne(userId);
    const activeAccounts = await this.findAll({
      userId,
      status: EAccountStatus.ACTIVE,
    });

    if (activeAccounts.length >= MAX_ACCOUNTS_PER_USER) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of accounts: ${MAX_ACCOUNTS_PER_USER}`,
      );
    }

    const accountTemplate = this.accountRepository.create({
      ...createAccountDto,
      initBalance: balance,
      user,
    });

    const account = await this.accountRepository.save(accountTemplate);

    return this.findOne(account.id);
  }

  async edit(
    id: Account['id'],
    editAccountDto: EditAccountDto,
  ): Promise<Account> {
    const oldAccount = await this.findOne(id);
    if (!oldAccount) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    const { currency, balance, initBalance } = oldAccount;

    this.validateAccountCurrencyEditing({
      oldCurrency: currency,
      ...editAccountDto,
    });

    const { rate = 1 } = editAccountDto;
    const account = await this.accountRepository.preload({
      id,
      ...editAccountDto,
      balance: balance * rate,
      initBalance: initBalance * rate,
    });

    this.validateAccountProperties(account);

    return this.accountRepository.save(account);
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
}
