import { Injectable, NotFoundException } from '@nestjs/common';
import { User, ECurrency } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      nickname: 'john',
      defaultCurrency: ECurrency.USD,
    },
    {
      id: '2',
      nickname: 'chris',
      defaultCurrency: ECurrency.EUR,
    },
    {
      id: '3',
      nickname: 'maria',
      defaultCurrency: ECurrency.UAH,
    },
  ];

  findAll(limit = 5, page = 1): any[] {
    return this.users.slice((page - 1) * limit, page * limit);
  }

  findOne(id: string): any {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  create(createUserDto: any): any {
    const newUser = {
      id: `${this.users.length + 1}`,
      ...createUserDto,
    };
    this.users.push(newUser);

    return newUser;
  }

  edit(id: string, editUserDto: any): any {
    const index = this.users.findIndex((user) => user.id === id);
    this.users[index] = {
      ...this.users[index],
      ...editUserDto,
    };

    return this.users[index];
  }

  delete(id: string): any {
    const index = this.users.findIndex((user) => user.id === id);
    const deletedUser = this.users[index];
    this.users.splice(index, 1);

    return deletedUser;
  }
}
