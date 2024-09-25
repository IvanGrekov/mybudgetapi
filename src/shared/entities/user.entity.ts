import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ECurrency } from '../enums/currency.enums';
import { EUserRole } from '../enums/user-role.enums';

import { Account } from './account.entity';
import { TransactionCategory } from './transaction-category.entity';

import { Transaction } from './transaction.entity';
import { DEFAULT_CURRENCY } from '../constants/currency.constants';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: EUserRole,
        default: EUserRole.USER,
    })
    role: EUserRole;

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

    @ApiProperty({
        description: 'Default currency for users accounts and transactions',
        enumName: 'ECurrency',
    })
    @Column({
        type: 'enum',
        enum: ECurrency,
        default: DEFAULT_CURRENCY,
    })
    defaultCurrency: ECurrency;

    @Column({ default: 'Europe/London' })
    timeZone: string;

    @CreateDateColumn()
    createdAt: Date;
}
