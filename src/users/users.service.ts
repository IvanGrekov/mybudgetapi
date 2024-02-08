import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';

import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { getDefaultAccountsDto } from './utils/defaultAccountsDto.util';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { PreloadAccountDto } from './dto/preload-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async findAll({ limit, offset }: PaginationQueryDto): Promise<User[]> {
    const users = await this.userRepository.find({
      take: limit,
      skip: (offset - 1) * limit,
      relations: {
        accounts: true,
      },
    });

    return users;
  }

  async findOne(id: User['id']): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        accounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const accounts = getDefaultAccountsDto(createUserDto.defaultCurrency).map(
      (accountDto) => this.preloadAccount(accountDto),
    );

    const user = this.userRepository.create({
      ...createUserDto,
      accounts,
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
}
