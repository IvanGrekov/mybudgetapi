import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';

import { ECurrency } from '../enums/currency.enums';
import { ELanguage } from '../enums/language.enums';

import { Account } from './account.entity';
import { TransactionCategory } from './transaction-category.entity';

import { Transaction } from './transaction.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => Account, ({ user }) => user, {
        cascade: true,
    })
    accounts: Account[];

    @OneToMany(() => TransactionCategory, ({ user }) => user, {
        cascade: true,
    })
    transactionCategories: TransactionCategory[];

    @OneToMany(() => Transaction, ({ user }) => user, {
        cascade: true,
    })
    transactions: Transaction[];

    @Column()
    nickname: string;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    defaultCurrency: ECurrency;

    @Column({
        type: 'enum',
        enum: ELanguage,
    })
    language: ELanguage;

    @Column()
    timeZone: string;

    @CreateDateColumn()
    createdAt: Date;
}
