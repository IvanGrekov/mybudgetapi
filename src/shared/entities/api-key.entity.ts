import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { User } from './user.entity';

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    uuid: string;

    @ManyToOne(() => User, ({ apiKeys }) => apiKeys, {
        onDelete: 'CASCADE',
    })
    user: User;
}
