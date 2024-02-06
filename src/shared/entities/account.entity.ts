import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { ECurrency } from '../enums/currency.enum';
import { User } from './user.entity';

export enum EAccountType {
  REGULAR = 'regular',
  SAVINGS = 'savings',
}

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  currency: ECurrency;

  @Column({
    type: 'enum',
    enum: EAccountType,
  })
  type: EAccountType;

  @Column()
  balance: number;
}
