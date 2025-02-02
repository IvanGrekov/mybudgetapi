import { IsNotEmpty } from 'class-validator';

export class GoogleSignInDto {
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    deviceId: string;
}
