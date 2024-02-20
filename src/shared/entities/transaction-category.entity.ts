import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionCategoryType } from '../enums/transaction-categories.enums';

@Entity()
export class TransactionCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactionCategories, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ETransactionCategoryType,
  })
  type: ETransactionCategoryType;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  currency: ECurrency;

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

  @Column({ default: 0 })
  order: number;
}
