import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { ECurrency } from '../shared/enums/currency.enums';

import { User } from '../users/user.entity';

import { ETransactionCategoryType } from './transaction-categories.enums';

@Entity()
export class TransactionCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactionCategories, {
    onDelete: 'CASCADE',
  })
  user: User;

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

  @Column()
  name: string;

  @Column()
  order: number;

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
}
