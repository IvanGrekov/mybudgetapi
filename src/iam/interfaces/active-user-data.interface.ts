import { User } from 'shared/entities/user.entity';

export interface IActiveUser {
    sub: User['id'];
    email: User['email'];
    role: User['role'];
    deviceId?: string;
}
