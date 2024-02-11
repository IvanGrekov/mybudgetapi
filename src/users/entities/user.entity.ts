import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ECurrency } from '../enums/currency.enum';
import { ELanguage } from '../enums/language.enum';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { TransactionCategory } from './transaction-category.entity';

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

  @Column({ default: null })
  overallBalance: number | null;

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
