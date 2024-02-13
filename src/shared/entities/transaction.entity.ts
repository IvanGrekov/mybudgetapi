import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { User } from './user.entity';
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

  @Column()
  description: string;
}
