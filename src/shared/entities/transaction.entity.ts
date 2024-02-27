import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionType } from '../enums/transactions.enums';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({
    type: 'enum',
    enum: ETransactionType,
  })
  type: ETransactionType;

  @Column()
  value: number;

  @Column({
    type: 'enum',
    enum: ECurrency,
  })
  currency: ECurrency;

  @Column({ default: '' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
