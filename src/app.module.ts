import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig, { validationSchema } from 'config/app.config';
import databaseConfig from 'config/database.config';
import { SharedModule } from 'shared/shared.module';
import { UsersModule } from 'users/users.module';
import { AccountsModule } from 'accounts/accounts.module';
import { TransactionCategoriesModule } from 'transaction-categories/transaction-categories.module';
import { TransactionsModule } from 'transactions/transactions.module';
import { IamModule } from 'iam/iam.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule.forFeature(appConfig), ConfigModule.forFeature(databaseConfig)],
            inject: [databaseConfig.KEY, appConfig.KEY],
            useFactory: (
                config: ConfigType<typeof databaseConfig>,
                { isDevelopment }: ConfigType<typeof appConfig>,
            ) => ({
                ...config,
                type: 'postgres',
                synchronize: isDevelopment,
                autoLoadEntities: isDevelopment,
            }),
        }),
        ConfigModule.forRoot({
            validationSchema,
        }),
        SharedModule,
        UsersModule,
        AccountsModule,
        TransactionCategoriesModule,
        TransactionsModule,
        IamModule,
    ],
})
export class AppModule {}
