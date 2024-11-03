import { IsNumber as IsNumberBase, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

import {
    ETransactionCategoryType,
    ETransactionCategoryStatus,
} from 'shared/enums/transaction-category.enums';

export class FindAllTransactionCategoriesDto {
    @Type(() => Number)
    @IsNumberBase()
    readonly userId: number;

    @IsEnum(ETransactionCategoryType)
    @IsOptional()
    readonly type?: ETransactionCategoryType;

    @IsEnum(ETransactionCategoryStatus)
    @IsOptional()
    readonly status?: ETransactionCategoryStatus;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly excludeId?: number;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly parentId?: number;

    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    readonly shouldFilterChildTransactionCategories?: boolean;
}
