import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';

import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

import { UsersService } from '../../../users/users.service';

import { HashingService } from '../../hashing/hashing.service';

import { TokensService } from './tokens.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';
import { TfaAuthenticationService } from '../services/tfa-authentication.service';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly usersService: UsersService,
        private readonly tfaAuthenticationService: TfaAuthenticationService,
        private readonly tokensService: TokensService,
    ) {}

    async signUp(createUserDto: CreateUserDto): Promise<GeneratedTokensDto> {
        const { email, password } = createUserDto;

        const user = await this.usersService.findByEmail(email);
        if (user) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashingService.hash(password);

        const newUser = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.tokensService.generateTokens(newUser);
    }

    async signIn(signInDto: SignInDto): Promise<GeneratedTokensDto> {
        const { email, password, tfaToken } = signInDto;

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await this.hashingService.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const { isTfaEnabled, tfaSecret } = user;
        if (isTfaEnabled) {
            const isTfaValid = this.tfaAuthenticationService.verifyToken({
                token: tfaToken,
                secret: tfaSecret,
            });
            if (!isTfaValid) {
                throw new UnauthorizedException('Two-factor authentication failed');
            }
        }

        return this.tokensService.generateTokens(user);
    }
}
