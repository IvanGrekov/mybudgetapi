import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { ECurrency } from '../enums/currency.enums';
import {
  ETransactionCategoryType,
  ETransactionCategoryStatus,
} from '../enums/transaction-categories.enums';

@Entity()
export class TransactionCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactionCategories, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.fromCategory, {
    cascade: true,
  })
  outgoingTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.toCategory, {
    cascade: true,
  })
  incomingTransactions: Transaction[];

  @OneToMany(() => TransactionCategory, (category) => category.parent, {
    cascade: true,
    nullable: true,
  })
  children: TransactionCategory[];

  @ManyToOne(() => TransactionCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: TransactionCategory;

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

  @CreateDateColumn()
  createdAt: Date;
}
