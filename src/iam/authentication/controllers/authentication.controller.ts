import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { toDataURL } from 'qrcode';

import { CreateUserDto } from 'shared/dtos/create-user.dto';

import { ActiveUser } from 'iam/decorators/active-user.decorator';
import { IActiveUser } from 'iam/interfaces/active-user-data.interface';

import { Auth } from 'iam/authentication/decorators/auth.decorator';
import { TokensService } from 'iam/authentication/services/tokens.service';
import { AuthenticationService } from 'iam/authentication/services/authentication.service';
import { ResetPasswordService } from 'iam/authentication/services/reset-password.service';
import { GoogleAuthenticationService } from 'iam/authentication/services/google-authentication.service';
import { TfaAuthenticationService } from 'iam/authentication/services/tfa-authentication.service';

import { EAuthType } from 'iam/authentication/enums/auth-type.enum';
import { SignInDto } from 'iam/authentication/dtos/sign-in.dto';
import { GeneratedTokensDto } from 'iam/authentication/dtos/generated-tokens.dto';
import { RefreshTokenDto } from 'iam/authentication/dtos/refresh-token.dto';
import { GoogleIdTokenDto } from 'iam/authentication/dtos/google-id-token.dto';
import { InitiateResetPasswordDto } from 'iam/authentication/dtos/initiate-reset-password.dto';
import { ResetPasswordDto } from 'iam/authentication/dtos/reset-password.dto';
import { InitiateResetPasswordResultDto } from 'iam/authentication/dtos/initiate-reset-password-result.dto';
import { ManageTfaDto } from 'iam/authentication/dtos/manage-tfa.dto';
import { InitiateTfaEnablingDtoResult } from 'iam/authentication/dtos/initiate-tfa-enabling-result.dto';

@ApiTags('authentication')
@Auth(EAuthType.None)
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly tokensService: TokensService,
        private readonly resetPasswordService: ResetPasswordService,
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
        return this.tokensService.refreshToken(refreshTokenDto);
    }

    @ApiOkResponse({ type: GeneratedTokensDto })
    @HttpCode(HttpStatus.OK)
    @Post('google')
    async googleSignIn(@Body() { token }: GoogleIdTokenDto): Promise<GeneratedTokensDto> {
        return this.googleAuthenticationService.authenticate(token);
    }

    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    @Post('initiate-reset-password')
    async initiateResetPassword(
        @Body() { email }: InitiateResetPasswordDto,
    ): Promise<InitiateResetPasswordResultDto> {
        await this.resetPasswordService.initiateResetPassword(email);

        return { message: 'Reset password code has been sent' };
    }

    @ApiOkResponse({ type: GeneratedTokensDto })
    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<GeneratedTokensDto> {
        return this.resetPasswordService.resetPassword(resetPasswordDto);
    }

    @Auth(EAuthType.Bearer, EAuthType.ApiKey)
    @ApiOkResponse({ type: InitiateTfaEnablingDtoResult })
    @HttpCode(HttpStatus.OK)
    @Post('initiate-tfa-enabling')
    async initiateTfaEnabling(
        @ActiveUser('email') activeUserEmail: IActiveUser['email'],
        @Res() response: Response,
    ): Promise<void> {
        const { secret, uri } = this.tfaAuthenticationService.generateSecret(activeUserEmail);

        await this.tfaAuthenticationService.initiateTfaEnabling({
            email: activeUserEmail,
            tfaSecret: secret,
        });

        toDataURL(uri, (error, dataUrl) => {
            if (error) {
                throw error;
            }

            response.send({ dataUrl, secret });
        });
    }

    @Auth(EAuthType.Bearer, EAuthType.ApiKey)
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    @Post('enable-tfa')
    async enableTfa(
        @ActiveUser('email') activeUserEmail: IActiveUser['email'],
        @Body() { tfaToken }: Pick<ManageTfaDto, 'tfaToken'>,
    ): Promise<void> {
        await this.tfaAuthenticationService.enableTfaForUser({
            email: activeUserEmail,
            tfaToken,
        });
    }

    @Auth(EAuthType.Bearer, EAuthType.ApiKey)
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    @Post('disable-tfa')
    async disableTfa(
        @ActiveUser('email') activeUserEmail: IActiveUser['email'],
        @Body() { tfaToken }: Pick<ManageTfaDto, 'tfaToken'>,
    ): Promise<void> {
        await this.tfaAuthenticationService.disableTfaForUser({
            email: activeUserEmail,
            tfaToken,
        });
    }
}
