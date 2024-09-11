import {
    Injectable,
    Inject,
    ConflictException,
    UnauthorizedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import { User } from '../../shared/entities/user.entity';
import { CreateUserDto } from '../../shared/dtos/create-user.dto';

import { UsersService } from '../../users/users.service';
import jwtConfig from '../../config/jwt.config';

import { HashingService } from '../hashing/hashing.service';

import { SignInDto } from './dtos/sign-in.dto';
import { SignInResultDto } from './dtos/sign-in-result.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly usersService: UsersService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        return user || null;
    }

    async signUp(createUserDto: CreateUserDto): Promise<void> {
        const { email, password } = createUserDto;

        const user = await this.findByEmail(email);
        if (user) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashingService.hash(password);

        await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });
    }

    async signIn(signInDto: SignInDto): Promise<SignInResultDto> {
        const { email, password } = signInDto;

        const user = await this.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await this.hashingService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('User not found');
        }

        try {
            const accessToken = await this.jwtService.signAsync(
                {
                    sub: user.id,
                    email: user.email,
                },
                this.jwtConfiguration,
            );

            return { accessToken };
        } catch (e) {
            console.log('AuthenticationService', JSON.stringify(e, null, 2));
            throw new InternalServerErrorException();
        }
    }
}
