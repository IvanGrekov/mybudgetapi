import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { User } from 'shared/entities/user.entity';
import { Transaction } from 'shared/entities/transaction.entity';
import { UsersModule } from 'users/users.module';

import { TransactionCategoriesController } from 'transaction-categories/transaction-categories.controller';
import { TransactionCategoriesService } from 'transaction-categories/transaction-categories.service';

@Module({
    imports: [TypeOrmModule.forFeature([TransactionCategory, User, Transaction]), UsersModule],
    controllers: [TransactionCategoriesController],
    providers: [TransactionCategoriesService],
})
export class TransactionCategoriesModule {}
