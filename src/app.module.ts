import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_CONTAINER_PORT),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV === 'development',
        }),
        SharedModule,
        UsersModule,
        AccountsModule,
        TransactionCategoriesModule,
        TransactionsModule,
    ],
})
export class AppModule {}
