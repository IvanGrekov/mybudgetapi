import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { CreateUserDto } from '../../shared/dtos/create-user.dto';

import { HashingService } from '../hashing/hashing.service';
import { UsersService } from '../../users/users.service';

import { SignInDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        return user || null;
    }

    async signUp(createUserDto: CreateUserDto): Promise<User> {
        const { email, password } = createUserDto;

        const user = await this.findByEmail(email);
        if (user) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashingService.hash(password);

        return this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
    }

    async signIn(signInDto: SignInDto): Promise<User> {
        const { email, password } = signInDto;

        const user = await this.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await this.hashingService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
