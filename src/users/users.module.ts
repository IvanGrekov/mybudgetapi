import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionCategory } from './entities/transaction-category.entity';
import { Transaction } from './entities/transaction.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { TransactionCategoriesController } from './transaction-categories/transaction-categories.controller';
import { TransactionCategoriesService } from './transaction-categories/transaction-categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, TransactionCategory, Transaction]),
  ],
  controllers: [
    UsersController,
    AccountsController,
    TransactionCategoriesController,
  ],
  providers: [UsersService, AccountsService, TransactionCategoriesService],
})
export class UsersModule {}
