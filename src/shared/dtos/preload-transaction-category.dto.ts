import { IsDefined, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import IsNumber from '../property-decorators/is-number.decorator';
import IsString from '../property-decorators/is-string.decorator';
import { ECurrency } from '../enums/currency.enums';
import { ETransactionCategoryType } from '../enums/transaction-category.enums';

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
