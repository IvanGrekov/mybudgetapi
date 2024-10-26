import { IsEnum, IsNumber, IsPositive, IsBoolean, IsOptional } from 'class-validator';

import { ECurrency } from '../../shared/enums/currency.enums';

export class EditUserCurrencyDto {
    @IsEnum(ECurrency)
    readonly defaultCurrency: ECurrency;

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
