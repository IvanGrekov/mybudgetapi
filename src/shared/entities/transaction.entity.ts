import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'shared/entities/user.entity';
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { ECurrency } from 'shared/enums/currency.enums';
import { ETransactionType } from 'shared/enums/transaction.enums';

@Index(['createdAt'])
@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
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
