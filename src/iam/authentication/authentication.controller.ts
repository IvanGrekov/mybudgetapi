import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { User } from '../../shared/entities/user.entity';
import { CreateUserDto } from '../../shared/dtos/create-user.dto';

import { Auth } from '../authentication/decorators/auth.decorator';
import { AuthenticationService } from '../authentication/authentication.service';

import { SignInDto } from './dtos/sign-in.dto';
import { SignInResultDto } from './dtos/sign-in-result.dto';
import { EAuthType } from './enums/auth-type.enum';

@ApiTags('authentication')
@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @ApiOkResponse()
    @Post('sign-up')
    @Auth(EAuthType.None)
    async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
        return this.authenticationService.signUp(createUserDto);
    }

    @ApiOkResponse({ type: User })
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    @Auth(EAuthType.None)
    async signIn(@Body() signInDto: SignInDto): Promise<SignInResultDto> {
        return this.authenticationService.signIn(signInDto);
    }
}
