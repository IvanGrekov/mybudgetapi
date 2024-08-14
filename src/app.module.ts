import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig, { validationSchema } from './config/app.config';
import databaseConfig from './config/database.config';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionCategoriesModule } from './transaction-categories/transaction-categories.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule.forFeature(databaseConfig)],
            inject: [databaseConfig.KEY],
            useFactory: ({
                host,
                port,
                name,
                username,
                password,
                synchronize,
            }: ConfigType<typeof databaseConfig>) => ({
                type: 'postgres',
                host,
                port,
                database: name,
                username,
                password,
                synchronize,
                autoLoadEntities: true,
            }),
        }),
        ConfigModule.forRoot({
            load: [appConfig],
            validationSchema,
        }),
        SharedModule,
        UsersModule,
        AccountsModule,
        TransactionCategoriesModule,
        TransactionsModule,
    ],
})
export class AppModule {}
