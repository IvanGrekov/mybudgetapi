import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { TransactionCategory } from './entities/transaction-category.entity';
import { Transaction } from './entities/transaction.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Account]),
    TypeOrmModule.forFeature([TransactionCategory]),
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [UsersController, AccountsController],
  providers: [UsersService, AccountsService],
})
export class UsersModule {}
