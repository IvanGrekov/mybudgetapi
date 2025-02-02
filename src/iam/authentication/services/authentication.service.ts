import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';

import { UsersService } from 'users/users.service';

import { HashingService } from 'iam/hashing/hashing.service';

import { TokensService } from 'iam/authentication/services/tokens.service';
import { SignUpDto } from 'iam/authentication/dtos/sign-up.dto';
import { SignInDto } from 'iam/authentication/dtos/sign-in.dto';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';
import { TfaAuthenticationService } from 'iam/authentication/services/tfa-authentication.service';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly usersService: UsersService,
        private readonly tfaAuthenticationService: TfaAuthenticationService,
        private readonly tokensService: TokensService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<GeneratedTokensDto> {
        const { email, password, deviceId } = signUpDto;

        const user = await this.usersService.findByEmail(email);
        if (user) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await this.hashingService.hash(password);

        const newUser = await this.usersService.create({
            ...signUpDto,
            password: hashedPassword,
        });

        return this.tokensService.generateTokens({ ...newUser, deviceId });
    }

    async signIn(signInDto: SignInDto): Promise<GeneratedTokensDto> {
        const { email, password, tfaToken, deviceId } = signInDto;

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.password && user.googleId) {
            throw new BadRequestException('Invalid email or password. Try signing in with Google');
        }

        if (!user.password) {
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

        return this.tokensService.generateTokens({ ...user, deviceId });
    }
}
