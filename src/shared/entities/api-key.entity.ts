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

    // NOTE: In a real-world application, we should not store the API key
    @Column({
        default: 'apiKey',
    })
    apiKey: string;

    @ManyToOne(() => User, ({ apiKeys }) => apiKeys, {
        onDelete: 'CASCADE',
    })
    user: User;
}
