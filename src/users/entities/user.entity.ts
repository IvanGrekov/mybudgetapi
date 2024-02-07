import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { ECurrency } from '../enums/currency.enum';
import { Account } from './account.entity';

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

  @JoinTable()
  @OneToMany(() => Account, (account) => account.user, {
    cascade: true,
  })
  accounts: Account[];
}
