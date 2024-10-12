import { IsEmail } from 'class-validator';

export class InitiateResetPasswordDto {
    @IsEmail()
    readonly email: string;
}
