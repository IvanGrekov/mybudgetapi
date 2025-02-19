import { IsString, IsOptional, IsNumberString, IsNotEmpty } from 'class-validator';

export class SignInDto {
    @IsString()
    readonly email: string;

    @IsString()
    readonly password: string;

    @IsOptional()
    @IsNumberString()
    readonly tfaToken?: string;

    @IsNotEmpty()
    deviceId: string;
}
