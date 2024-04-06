import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from '../shared/entities/transaction.entity';
import { Account } from '../shared/entities/account.entity';
import { UsersModule } from '../users/users.module';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, Account]), UsersModule],
    controllers: [TransactionsController],
    providers: [TransactionsService],
})
export class TransactionsModule {}
