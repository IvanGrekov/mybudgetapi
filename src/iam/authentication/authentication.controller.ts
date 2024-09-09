import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { User } from '../../shared/entities/user.entity';
import { CreateUserDto } from '../../shared/dtos/create-user.dto';
import { Public } from '../../shared/decorators/public.decorator';

import { AuthenticationService } from '../authentication/authentication.service';

import { SignInDto } from './dtos/sign-in.dto';

@ApiTags('authentication')
@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @ApiOkResponse({ type: User })
    @Post('sign-up')
    @Public()
    async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.authenticationService.signUp(createUserDto);
    }

    @ApiOkResponse({ type: User })
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    @Public()
    async signIn(@Body() signInDto: SignInDto): Promise<User> {
        return this.authenticationService.signIn(signInDto);
    }
}
