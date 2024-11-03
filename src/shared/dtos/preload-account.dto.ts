import { IsDefined, IsEnum, IsBoolean, IsOptional } from 'class-validator';

import IsNumber from 'shared/property-decorators/is-number.decorator';
import IsString from 'shared/property-decorators/is-string.decorator';
import { ECurrency } from 'shared/enums/currency.enums';
import { EAccountType } from 'shared/enums/account.enums';

export class PreloadAccountDto {
    @IsDefined()
    @IsString()
    readonly name: string;

    @IsEnum(EAccountType)
    readonly type: EAccountType;

    @IsEnum(ECurrency)
    readonly currency: ECurrency;

    @IsDefined()
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
