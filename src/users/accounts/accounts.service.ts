import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EAccountType } from '../enums/account-type.enum';
import { EDebtType } from '../enums/debt-type.enum';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';
import { EditAccountDto } from '../dto/edit-account.dto';
import { UsersService } from '../users.service';
import { MAX_ACCOUNTS_PER_USER } from '../constants/accounts.constant';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly usersService: UsersService,
  ) {}

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
    this.validateAccountType(createAccountDto);

    const user = await this.usersService.findOne(createAccountDto.userId);

    if (user.accounts.length >= MAX_ACCOUNTS_PER_USER) {
      throw new ForbiddenException(
        `User #${user.id} already has the maximum number of accounts`,
      );
    }

    const account = this.accountRepository.create({
      ...createAccountDto,
      user: {
        ...user,
        accounts: undefined,
        transactionCategories: undefined,
      },
    });

    return this.accountRepository.save(account);
  }

  async edit(
    id: Account['id'],
    editAccountDto: EditAccountDto,
  ): Promise<Account> {
    this.validateAccountType(editAccountDto);

    const account = await this.accountRepository.preload({
      id,
      ...editAccountDto,
    });

    if (!account) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    return this.accountRepository.save(account);
  }

  async delete(id: Account['id']): Promise<Account> {
    const account = await this.findOne(id);

    return this.accountRepository.remove(account);
  }

  validateAccountType({
    type,
    debtType,
  }: {
    type?: EAccountType;
    debtType?: EDebtType;
  }): void {
    if (type === EAccountType.DEBT && !debtType) {
      throw new BadRequestException(
        `Account of type 'debt' must have a 'debtType'`,
      );
    }
  }
}
