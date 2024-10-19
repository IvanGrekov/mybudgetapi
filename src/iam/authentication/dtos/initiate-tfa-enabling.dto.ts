import { IsEmail, IsString } from 'class-validator';

export class InitiateTfaEnablingDto {
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly tfaSecret: string;
}
