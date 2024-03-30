import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { User } from '../shared/entities/user.entity';
import { UsersModule } from '../users/users.module';

import { TransactionCategoriesController } from './transaction-categories.controller';
import { TransactionCategoriesService } from './transaction-categories.service';

@Module({
    imports: [TypeOrmModule.forFeature([TransactionCategory, User]), UsersModule],
    controllers: [TransactionCategoriesController],
    providers: [TransactionCategoriesService],
})
export class TransactionCategoriesModule {}
