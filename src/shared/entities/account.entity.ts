import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column,
    CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { ECurrency } from '../enums/currency.enums';
import { EAccountType, EAccountStatus } from '../enums/account.enums';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, ({ accounts }) => accounts, {
        onDelete: 'CASCADE',
    })
    @Exclude()
    user: User;

    @OneToMany(() => Transaction, ({ fromAccount }) => fromAccount, {
        cascade: true,
    })
    @Exclude()
    outgoingTransactions: Transaction[];

    @OneToMany(() => Transaction, ({ toAccount }) => toAccount, {
        cascade: true,
    })
    @Exclude()
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

    @Column({ type: 'real' })
    balance: number;

    @Column({ type: 'real' })
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
