import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column,
    CreateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { ECurrency } from '../enums/currency.enums';
import { EAccountType, EAccountStatus } from '../enums/account.enums';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.accounts, {
        onDelete: 'CASCADE',
    })
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.fromAccount, {
        cascade: true,
    })
    outgoingTransactions: Transaction[];

    @OneToMany(() => Transaction, (transaction) => transaction.toAccount, {
        cascade: true,
    })
    incomingTransactions: Transaction[];

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: EAccountType,
    })
    type: EAccountType;

    @Column({
        type: 'enum',
        enum: EAccountStatus,
        default: EAccountStatus.ACTIVE,
    })
    status: EAccountStatus;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    currency: ECurrency;

    @Column()
    balance: number;

    @Column()
    initBalance: number;

    @Column({ default: false })
    shouldHideFromOverallBalance: boolean;

    @Column({ default: false })
    shouldShowAsIncome: boolean;

    @Column({ default: false })
    shouldShowAsExpense: boolean;

    @Column({ default: 0 })
    order: number;

    @CreateDateColumn()
    createdAt: Date;
}
