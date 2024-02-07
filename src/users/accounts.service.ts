import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../shared/constants/pagination.constant';

import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { EditAccountDto } from './dto/edit-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  findAll({
    limit = DEFAULT_LIMIT,
    page = DEFAULT_PAGE,
    userId,
  }): Promise<Account[]> {
    userId;

    return this.accountRepository.find({
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: Account['id']): Promise<Account> {
    const account = await this.accountRepository.findOneBy({
      id,
    });

    if (!account) {
      throw new NotFoundException(`Account #${id} not found`);
    }

    return account;
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create(createAccountDto);

    return this.accountRepository.save(account);
  }

  async edit(
    id: Account['id'],
    editAccountDto: EditAccountDto,
  ): Promise<Account> {
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
}
