import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

import { Auth } from '../decorators/auth.decorator';
import { AuthenticationService } from '../services/authentication.service';
import { GoogleAuthenticationService } from '../services/google-authentication.service';

import { SignInDto } from '../dtos/sign-in.dto';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GoogleIdTokenDto } from '../dtos/google-id-token.dto';
import { EAuthType } from '../enums/auth-type.enum';

@ApiTags('authentication')
@Auth(EAuthType.None)
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly googleAuthenticationService: GoogleAuthenticationService,
    ) {}

    @ApiOkResponse({ type: GeneratedTokensDto })
    @Post('sign-up')
    async signUp(@Body() createUserDto: CreateUserDto): Promise<GeneratedTokensDto> {
        return this.authenticationService.signUp(createUserDto);
    }

    @ApiOkResponse({ type: GeneratedTokensDto })
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Body() signInDto: SignInDto): Promise<GeneratedTokensDto> {
        return this.authenticationService.signIn(signInDto);
    }

    @ApiOkResponse({ type: GeneratedTokensDto })
    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<GeneratedTokensDto> {
        return this.authenticationService.refreshToken(refreshTokenDto);
    }

    @ApiOkResponse({ type: GeneratedTokensDto })
    @HttpCode(HttpStatus.OK)
    @Post('google')
    async googleSignIn(@Body() { token }: GoogleIdTokenDto): Promise<GeneratedTokensDto> {
        return this.googleAuthenticationService.authenticate(token);
    }
}
