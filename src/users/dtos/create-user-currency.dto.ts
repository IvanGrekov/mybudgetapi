import { PickType } from '@nestjs/mapped-types';
import { IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class EditUserCurrencyDto extends PickType(CreateUserDto, ['defaultCurrency']) {
    @IsNumber()
    @IsPositive()
    readonly rate: number;

    @IsBoolean()
    @IsOptional()
    readonly isForceCurrencyUpdate?: boolean;
}
