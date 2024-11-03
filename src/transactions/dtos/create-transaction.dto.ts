import {
    IsNumber as IsNumberBase,
    IsEnum,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

import { ETransactionType } from 'shared/enums/transaction.enums';

export class CreateTransactionDto {
    @IsNumberBase()
    readonly userId: number;

    @IsNumberBase()
    @IsOptional()
    readonly fromAccountId?: number;

    @IsNumberBase()
    @IsOptional()
    readonly toAccountId?: number;

    @IsNumberBase()
    @IsOptional()
    readonly fromCategoryId?: number;

    @IsNumberBase()
    @IsOptional()
    readonly toCategoryId?: number;

    @IsEnum(ETransactionType)
    readonly type: ETransactionType;

    @IsNumberBase()
    @IsPositive()
    readonly value: number;

    @IsNumberBase()
    @IsPositive()
    @IsOptional()
    readonly fee?: number;

    @IsNumberBase()
    @IsPositive()
    @IsOptional()
    readonly currencyRate?: number;

    @IsString()
    @IsOptional()
    readonly description?: string;
}
