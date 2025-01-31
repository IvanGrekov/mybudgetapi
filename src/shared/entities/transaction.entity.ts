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
import TwoDecimalsNumericColumn from 'shared/property-decorators/two-decimals-numeric-column.decorator';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
    @ManyToOne(() => User, ({ transactions }) => transactions, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Index()
    @ManyToOne(() => Account, ({ outgoingTransactions }) => outgoingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    fromAccount?: Account | null;

    @TwoDecimalsNumericColumn({ nullable: true })
    fromAccountUpdatedBalance?: number;

    @Index()
    @ManyToOne(() => Account, ({ incomingTransactions }) => incomingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    toAccount?: Account | null;

    @TwoDecimalsNumericColumn({ nullable: true })
    toAccountUpdatedBalance?: number | null;

    @Index()
    @ManyToOne(() => TransactionCategory, ({ outgoingTransactions }) => outgoingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    fromCategory?: TransactionCategory | null;

    @Index()
    @ManyToOne(() => TransactionCategory, ({ incomingTransactions }) => incomingTransactions, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    toCategory?: TransactionCategory | null;

    @Column({
        type: 'enum',
        enum: ETransactionType,
    })
    type: ETransactionType;

    @TwoDecimalsNumericColumn()
    value: number;

    @TwoDecimalsNumericColumn({ nullable: true })
    fee?: number | null;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    currency: ECurrency;

    @Column({ type: 'real', nullable: true })
    currencyRate?: number | null;

    @Column({ default: '' })
    description: string;

    @Index()
    @CreateDateColumn()
    createdAt: Date;
}
