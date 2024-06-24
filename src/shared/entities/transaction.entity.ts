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

    @ManyToOne(() => User, (user) => user.transactions, {
        onDelete: 'CASCADE',
    })
    user: User;

    @ManyToOne(() => Account, (account) => account.outgoingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    fromAccount?: Account;

    @Column({ nullable: true, type: 'real' })
    fromAccountUpdatedBalance?: number;

    @ManyToOne(() => Account, (account) => account.incomingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    toAccount?: Account;

    @Column({ nullable: true, type: 'real' })
    toAccountUpdatedBalance?: number;

    @ManyToOne(
        () => TransactionCategory,
        (transactionCategory) => transactionCategory.outgoingTransactions,
        {
            nullable: true,
            onDelete: 'CASCADE',
        },
    )
    fromCategory?: TransactionCategory;

    @ManyToOne(
        () => TransactionCategory,
        (transactionCategory) => transactionCategory.incomingTransactions,
        {
            nullable: true,
            onDelete: 'CASCADE',
        },
    )
    toCategory?: TransactionCategory;

    @Column({
        type: 'enum',
        enum: ETransactionType,
    })
    type: ETransactionType;

    @Column({ type: 'real' })
    value: number;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    currency: ECurrency;

    @Column({ default: '' })
    description: string;

    @CreateDateColumn()
    createdAt: Date;
}
