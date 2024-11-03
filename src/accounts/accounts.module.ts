import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Account } from 'shared/entities/account.entity';
import { UsersModule } from 'users/users.module';
import { Transaction } from 'shared/entities/transaction.entity';

import { AccountsController } from 'accounts/accounts.controller';
import { AccountsService } from 'accounts/accounts.service';

@Module({
    imports: [TypeOrmModule.forFeature([Account, Transaction]), UsersModule],
    controllers: [AccountsController],
    providers: [AccountsService],
})
export class AccountsModule {}
