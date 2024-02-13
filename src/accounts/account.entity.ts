import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { ECurrency } from '../shared/enums/currency.enums';

import { User } from '../users/user.entity';

import { EAccountType } from './accounts.enums';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EAccountType,
  })
  type: EAccountType;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  currency: ECurrency;

  @Column()
  balance: number;

  @Column()
  initBalance: number;

  @Column()
  shouldHideFromOverallBalance: boolean;

  @Column({ default: false })
  shouldShowAsIncome: boolean;

  @Column({ default: false })
  shouldShowAsExpense: boolean;
}
