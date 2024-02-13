import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

import { EAccountType } from './accounts.enums';
import { Account } from './account.entity';
import { CreateAccountDto } from './accounts.dto';
import { EditAccountDto } from './accounts.dto';
import { MAX_ACCOUNTS_PER_USER } from './accounts.constants';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly usersService: UsersService,
  ) {}

  async findAll(userId: User['id']): Promise<Account[]> {
    if (!userId) {
      throw new BadRequestException('userId query parameter is required');
    }

    return this.accountRepository.find({
      where: { user: { id: userId } },
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

    if (user.accounts.length >= MAX_ACCOUNTS_PER_USER) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of accounts`,
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
    const account = await this.accountRepository.preload({
      id,
      ...editAccountDto,
    });

    this.validateAccountProperties(account);

    if (!account) {
      throw new NotFoundException(`Account #${id} not found`);
    }

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
        `Only 'I owe' accounts can have 'shouldShowAsExpense'`,
      );
    }

    if (shouldShowAsIncome && type !== EAccountType.OWE_ME) {
      throw new BadRequestException(
        `Only 'Owe me' accounts can have 'shouldShowAsIncome'`,
      );
    }
  }
}
