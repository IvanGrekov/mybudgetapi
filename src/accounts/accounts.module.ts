import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from '../shared/entities/account.entity';
import { User } from '../shared/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Transaction } from '../shared/entities/transaction.entity';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User, Transaction]),
    UsersModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
