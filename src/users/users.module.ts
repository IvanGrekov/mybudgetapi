import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { User } from '../shared/entities/user.entity';
import { Transaction } from '../shared/entities/transaction.entity';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, TransactionCategory, Transaction]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
