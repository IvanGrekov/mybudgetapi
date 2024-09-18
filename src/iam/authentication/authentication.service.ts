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
import { IActiveUser } from '../interfaces/active-user-data.interface';

import { SignTokenDto } from './dtos/sign-token.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { GeneratedTokensDto } from './dtos/generated-tokens.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

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

    private async findByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { email } });

        return user || null;
    }

    private async signToken<T extends { sub: number }>({
        payload,
        expiresIn,
    }: SignTokenDto<T>): Promise<string> {
        return this.jwtService.signAsync(payload, {
            secret: this.jwtConfiguration.secret,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
            expiresIn,
        });
    }

    private async generateTokens(user: User): Promise<GeneratedTokensDto> {
        try {
            const payload: IActiveUser = {
                sub: user.id,
                email: user.email,
            };

            const [accessToken, refreshToken] = await Promise.all([
                this.signToken<IActiveUser>({
                    payload,
                    expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
                }),
                this.signToken<IActiveUser>({
                    payload,
                    expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
                }),
            ]);

            return { accessToken, refreshToken };
        } catch (e) {
            console.log('Tokens Signing Failed', JSON.stringify(e, null, 2));
            throw new InternalServerErrorException();
        }
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

    async signIn(signInDto: SignInDto): Promise<GeneratedTokensDto> {
        const { email, password } = signInDto;

        const user = await this.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await this.hashingService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('User not found');
        }

        return this.generateTokens(user);
    }

    async refreshToken({ refreshToken }: RefreshTokenDto): Promise<GeneratedTokensDto> {
        try {
            const { sub } = await this.jwtService.verifyAsync<IActiveUser>(refreshToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });

            const user = await this.userRepository.findOne({ where: { id: sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return this.generateTokens(user);
        } catch (e) {
            console.log('Refresh Token Verifying Failed', JSON.stringify(e, null, 2));
            throw new UnauthorizedException();
        }
    }
}
