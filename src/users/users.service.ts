import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../shared/entities/user.entity';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../shared/constants/pagination.constant';

import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(limit = DEFAULT_LIMIT, page = DEFAULT_PAGE): Promise<User[]> {
    const users = await this.userRepository.find({
      take: limit,
      skip: (page - 1) * limit,
    });

    return users;
  }

  async findOne(id: User['id']): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      accounts: [],
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
}
