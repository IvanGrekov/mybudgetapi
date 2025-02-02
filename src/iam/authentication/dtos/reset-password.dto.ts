import { IsEmail, IsDefined, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import IsString from 'shared/property-decorators/is-string.decorator';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from 'shared/constants/password.constants';

export class ResetPasswordDto {
    @IsEmail()
    readonly email: string;

    @IsDefined()
    @IsString({
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
    })
    readonly newPassword: string;

    @Type(() => Number)
    @IsNumber()
    readonly verificationCode: string;

    @IsNotEmpty()
    deviceId: string;
}
