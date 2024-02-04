import { Injectable, NotFoundException } from '@nestjs/common';
import { User, ECurrency, ELanguage } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user-dto/create-user.dto';
import { EditUserDto } from './dto/create-user-dto/edit-user.dto';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      nickname: 'john',
      defaultCurrency: ECurrency.USD,
      language: ELanguage.EN,
    },
    {
      id: '2',
      nickname: 'chris',
      defaultCurrency: ECurrency.EUR,
      language: ELanguage.EN,
    },
    {
      id: '3',
      nickname: 'maria',
      defaultCurrency: ECurrency.UAH,
      language: ELanguage.UA,
    },
  ];

  findAll(limit = 5, page = 1): User[] {
    return this.users.slice((page - 1) * limit, page * limit);
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const newUser = {
      id: `${this.users.length + 1}`,
      ...createUserDto,
    };
    this.users.push(newUser);

    return newUser;
  }

  edit(id: string, editUserDto: EditUserDto): User {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException(`User #${id} not found`);
    }

    this.users[index] = {
      ...this.users[index],
      ...editUserDto,
    };

    return this.users[index];
  }

  delete(id: string): User {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      throw new NotFoundException(`User #${id} not found`);
    }

    const deletedUser = this.users[index];
    this.users.splice(index, 1);

    return deletedUser;
  }
}
