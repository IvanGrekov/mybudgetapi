import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ECurrency } from '../enums/currency.enum';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { TransactionCategory } from './transaction-category.entity';

export enum ELanguage {
  EN = 'EN',
  UA = 'UA',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  defaultCurrency: ECurrency;

  @Column({
    type: 'enum',
    enum: ELanguage,
  })
  language: ELanguage;

  @OneToMany(() => Account, (account) => account.user, {
    cascade: true,
  })
  accounts: Account[];

  @OneToMany(
    () => TransactionCategory,
    (transactionCategory) => transactionCategory.user,
    {
      cascade: true,
    },
  )
  transactionCategories: TransactionCategory[];

  @OneToMany(() => Account, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions: Transaction[];
}
