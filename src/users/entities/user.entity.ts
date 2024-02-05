import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ECurrency } from '../../shared/enums/currency.enum';

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
}
