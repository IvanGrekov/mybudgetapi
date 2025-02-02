import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
    @IsNotEmpty()
    refreshToken: string;

    @IsNotEmpty()
    deviceId: string;
}
