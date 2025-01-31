import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Column,
    CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'shared/entities/user.entity';
import { Transaction } from 'shared/entities/transaction.entity';
import { ECurrency } from 'shared/enums/currency.enums';
import { EAccountType, EAccountStatus } from 'shared/enums/account.enums';
import TwoDecimalsNumericColumn from 'shared/property-decorators/two-decimals-numeric-column.decorator';

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

    @TwoDecimalsNumericColumn()
    balance: number;

    @TwoDecimalsNumericColumn()
    initBalance: number;

    @Column({ default: false })
    shouldHideFromOverallBalance: boolean;

    @Column({ default: false })
    shouldShowAsIncome: boolean;

    @Column({ default: false })
    shouldShowAsExpense: boolean;

    @Column({ default: 0 })
    order: number;

    @Column({ nullable: true })
    iconName?: string | null;

    @Column({ nullable: true })
    iconColor?: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
