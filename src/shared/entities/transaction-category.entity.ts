import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'shared/entities/user.entity';
import { Transaction } from 'shared/entities/transaction.entity';
import { ECurrency } from 'shared/enums/currency.enums';
import {
    ETransactionCategoryType,
    ETransactionCategoryStatus,
} from 'shared/enums/transaction-category.enums';

@Entity()
export class TransactionCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Exclude()
    @ManyToOne(() => User, ({ transactionCategories }) => transactionCategories, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Exclude()
    @OneToMany(() => Transaction, ({ fromCategory }) => fromCategory, {
        cascade: true,
    })
    outgoingTransactions: Transaction[];

    @Exclude()
    @OneToMany(() => Transaction, ({ toCategory }) => toCategory, {
        cascade: true,
    })
    incomingTransactions: Transaction[];

    @OneToMany(() => TransactionCategory, ({ parent }) => parent, {
        cascade: true,
        nullable: true,
    })
    children?: TransactionCategory[] | null;

    @ManyToOne(() => TransactionCategory, ({ children }) => children, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    parent?: TransactionCategory | null;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: ETransactionCategoryType,
    })
    type: ETransactionCategoryType;

    @Column({
        type: 'enum',
        enum: ETransactionCategoryStatus,
        default: ETransactionCategoryStatus.ACTIVE,
    })
    status: ETransactionCategoryStatus;

    @Column({
        type: 'enum',
        enum: ECurrency,
    })
    currency: ECurrency;

    @Column({ default: 0 })
    order: number;

    @Column({ nullable: true })
    iconName?: string | null;

    @Column({ nullable: true })
    iconColor?: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
