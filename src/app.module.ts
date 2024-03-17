import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { TransactionsModule } from './transactions/transactions.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      username: 'postgres',
      password: 'Cosonic56',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SharedModule,
    UsersModule,
    AccountsModule,
    TransactionCategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
