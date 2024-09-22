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
import { randomUUID } from 'crypto';

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
import { RefreshTokedIdsStorage } from './refresh-toked-ids.storage';
import { IRefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import InvalidatedRefreshToken from './exceptions/invalidated-refresh-token.exception';

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
        private readonly refreshTokenIdsStorage: RefreshTokedIdsStorage,
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
            const userId = user.id;
            const payload: IActiveUser = {
                sub: userId,
                email: user.email,
            };
            const refreshTokenId = randomUUID();

            const [accessToken, refreshToken] = await Promise.all([
                this.signToken<IActiveUser>({
                    payload,
                    expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
                }),
                this.signToken<IRefreshTokenPayload>({
                    payload: { ...payload, refreshTokenId },
                    expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
                }),
            ]);

            await this.refreshTokenIdsStorage.insert(userId, refreshTokenId);

            return { accessToken, refreshToken };
        } catch (e) {
            console.log('Tokens Signing Failed', JSON.stringify(e, null, 2));
            throw new InternalServerErrorException();
        }
    }

    async signUp(createUserDto: CreateUserDto): Promise<GeneratedTokensDto> {
        const { email, password } = createUserDto;

        const user = await this.findByEmail(email);
        if (user) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashingService.hash(password);

        const newUser = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.generateTokens(newUser);
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
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<IRefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.jwtConfiguration.secret,
                    audience: this.jwtConfiguration.audience,
                    issuer: this.jwtConfiguration.issuer,
                },
            );

            const user = await this.userRepository.findOne({ where: { id: sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const userId = user.id;
            await this.refreshTokenIdsStorage.validate(userId, refreshTokenId);

            return this.generateTokens(user);
        } catch (e) {
            if (e instanceof InvalidatedRefreshToken) {
                console.log('Refresh Token Is Invalid');
                throw new UnauthorizedException('Access Denied');
            }

            console.log('Refresh Token Verifying Failed', JSON.stringify(e, null, 2));

            throw new UnauthorizedException();
        }
    }
}
