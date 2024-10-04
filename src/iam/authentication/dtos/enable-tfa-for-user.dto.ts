import { IsEmail, IsString } from 'class-validator';

export class EnableTfaForUserDto {
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly tfaSecret: string;
}
