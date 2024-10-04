import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

import { Auth } from '../decorators/auth.decorator';
import { AuthenticationService } from '../services/authentication.service';
import { GoogleAuthenticationService } from '../services/google-authentication.service';
import { TfaAuthenticationService } from '../services/tfa-authentication.service';

import { ActiveUser } from '../../decorators/active-user.decorator';
import { IActiveUser } from '../../interfaces/active-user-data.interface';

import { EAuthType } from '../enums/auth-type.enum';
import { SignInDto } from '../dtos/sign-in.dto';
import { GeneratedTokensDto } from '../dtos/generated-tokens.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { GoogleIdTokenDto } from '../dtos/google-id-token.dto';
import { toFileStream } from 'qrcode';

@ApiTags('authentication')
@Auth(EAuthType.None)
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly googleAuthenticationService: GoogleAuthenticationService,
        private readonly tfaAuthenticationService: TfaAuthenticationService,
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

    @Auth(EAuthType.Bearer, EAuthType.ApiKey)
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    @Post('enable-tfa')
    async enableTfa(
        @ActiveUser('email') activeUserEmail: IActiveUser['email'],
        @Res() response: Response,
    ): Promise<void> {
        const { secret, uri } = this.tfaAuthenticationService.generateSecret(activeUserEmail);
        await this.tfaAuthenticationService.enableTfaForUser({
            email: activeUserEmail,
            tfaSecret: secret,
        });
        response.type('png');

        return toFileStream(response, uri);
    }
}
