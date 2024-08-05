import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';

import { User } from './user.entity';
import { Account } from './account.entity';
import { TransactionCategory } from './transaction-category.entity';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionType } from '../enums/transaction.enums';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, ({ transactions }) => transactions, {
        onDelete: 'CASCADE',
    })
    user: User;

    @ManyToOne(() => Account, ({ outgoingTransactions }) => outgoingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    fromAccount?: Account;

    @Column({ nullable: true, type: 'real' })
    fromAccountUpdatedBalance?: number;

    @ManyToOne(() => Account, ({ incomingTransactions }) => incomingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    toAccount?: Account;

    @Column({ nullable: true, type: 'real' })
    toAccountUpdatedBalance?: number;

    @ManyToOne(() => TransactionCategory, ({ outgoingTransactions }) => outgoingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    fromCategory?: TransactionCategory;

    @ManyToOne(() => TransactionCategory, ({ incomingTransactions }) => incomingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    toCategory?: TransactionCategory;

    @Column({
        type: 'enum',
        enum: ETransactionType,
    })
    type: ETransactionType;

    @Column({ type: 'real' })
    value: number;

    @Column({ type: 'real', nullable: true })
    fee?: number;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    currency: ECurrency;

    @Column({ type: 'real', nullable: true })
    currencyRate?: number;

    @Column({ default: '' })
    description: string;

    @CreateDateColumn()
    createdAt: Date;
}
