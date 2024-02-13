import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ECurrency } from '../shared/enums/currency.enums';
import { ELanguage } from '../shared/enums/language.enums';

import { Account } from '../accounts/account.entity';
import { TransactionCategory } from '../transaction-categories/transaction-category.entity';

import { Transaction } from './transaction.entity';

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
