import { IsEnum, IsBoolean, IsOptional } from 'class-validator';

import IsNumber from '../property-decorators/is-number.decorator';
import IsString from '../property-decorators/is-string.decorator';
import { ECurrency } from '../enums/currency.enums';
import { EAccountType } from '../enums/account.enums';

export class PreloadAccountDto {
    @IsString()
    readonly name: string;

    @IsEnum(EAccountType)
    readonly type: EAccountType;

    @IsEnum(ECurrency)
    readonly currency: ECurrency;

    @IsNumber()
    readonly balance: number;

    @IsBoolean()
    @IsOptional()
    readonly shouldHideFromOverallBalance?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly shouldShowAsIncome?: boolean;

    @IsBoolean()
    @IsOptional()
    readonly shouldShowAsExpense?: boolean;

    @IsNumber()
    @IsOptional()
    readonly order?: number;
}
