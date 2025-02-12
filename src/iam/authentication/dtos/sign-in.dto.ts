import { IsString, IsOptional, IsNumberString, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';

import { CreateUserDto } from 'shared/dtos/create-user.dto';

export class SignInDto extends PickType(CreateUserDto, ['email']) {
    @IsString()
    readonly password: string;

    @IsOptional()
    @IsNumberString()
    readonly tfaToken?: string;

    @IsNotEmpty()
    deviceId: string;
}
