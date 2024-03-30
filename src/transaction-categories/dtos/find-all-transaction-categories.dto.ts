import { IsNumber as IsNumberBase, IsEnum, IsOptional, IsBoolean } from 'class-validator';

import {
    ETransactionCategoryType,
    ETransactionCategoryStatus,
} from '../../shared/enums/transaction-category.enums';

export class FindAllTransactionCategoriesDto {
    @IsNumberBase()
    readonly userId: number;

    @IsEnum(ETransactionCategoryType)
    @IsOptional()
    readonly type?: ETransactionCategoryType;

    @IsEnum(ETransactionCategoryStatus)
    @IsOptional()
    readonly status?: ETransactionCategoryStatus;

    @IsNumberBase()
    @IsOptional()
    readonly excludeId?: number;

    @IsNumberBase()
    @IsOptional()
    readonly parentId?: number;

    @IsBoolean()
    @IsOptional()
    readonly shouldFilterChildTransactionCategories?: boolean;
}
