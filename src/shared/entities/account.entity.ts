import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';
import { ECurrency } from '../enums/currency.enums';
import { EAccountType, EAccountStatus } from '../enums/accounts.enums';

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
    enum: EAccountStatus,
    default: EAccountStatus.ACTIVE,
  })
  status: EAccountStatus;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  currency: ECurrency;

  @Column()
  balance: number;

  @Column()
  initBalance: number;

  @Column({ default: false })
  shouldHideFromOverallBalance: boolean;

  @Column({ default: false })
  shouldShowAsIncome: boolean;

  @Column({ default: false })
  shouldShowAsExpense: boolean;

  @Column({ default: 0 })
  order: number;
}
