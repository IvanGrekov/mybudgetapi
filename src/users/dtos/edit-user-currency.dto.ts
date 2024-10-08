import { PickType } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';

import { CreateUserDto } from '../../shared/dtos/create-user.dto';

export class EditUserCurrencyDto extends PickType(CreateUserDto, ['defaultCurrency']) {
    @IsNumber()
    @IsPositive()
    readonly rate: number;

    @IsBoolean()
    @IsOptional()
    readonly isAccountsCurrencySoftUpdate?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly isTransactionCategoriesCurrencySoftUpdate?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly isTransactionCategoriesCurrencyForceUpdate?: boolean;
}
