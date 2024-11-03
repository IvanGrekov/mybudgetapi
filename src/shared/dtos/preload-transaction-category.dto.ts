import { IsDefined, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import IsNumber from 'shared/property-decorators/is-number.decorator';
import IsString from 'shared/property-decorators/is-string.decorator';
import { ECurrency } from 'shared/enums/currency.enums';
import { ETransactionCategoryType } from 'shared/enums/transaction-category.enums';

export class PreloadTransactionCategoryDto {
    @IsDefined()
    @IsString()
    readonly name: string;

    @IsEnum(ETransactionCategoryType)
    readonly type: ETransactionCategoryType;

    @IsEnum(ECurrency)
    readonly currency: ECurrency;

    @IsNumber()
    @IsOptional()
    readonly order?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PreloadTransactionCategoryDto)
    @IsOptional()
    children?: PreloadTransactionCategoryDto[];
}
