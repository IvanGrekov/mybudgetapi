import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { ECurrency } from '../enums/currency.enum';
import { EAccountType } from '../enums/account-type.enum';
import { EDebtType } from '../enums/debt-type.enum';
import { User } from './user.entity';

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

  @Column({
    type: 'enum',
    enum: EDebtType,
    nullable: true,
  })
  debtType: EDebtType;

  @Column()
  balance: number;

  @Column()
  shouldHideFromOverallBalance: boolean;
}
