import { IsNumber, IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';

import { ETransactionType } from 'shared/enums/transaction.enums';

export class CreateTransactionDto {
    @IsNumber()
    readonly userId: number;

    @IsNumber()
    @IsOptional()
    readonly fromAccountId?: number;

    @IsNumber()
    @IsOptional()
    readonly toAccountId?: number;

    @IsNumber()
    @IsOptional()
    readonly fromCategoryId?: number;

    @IsNumber()
    @IsOptional()
    readonly toCategoryId?: number;

    @IsEnum(ETransactionType)
    readonly type: ETransactionType;

    @IsNumber()
    @IsPositive()
    readonly value: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    readonly fee?: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    readonly currencyRate?: number;

    @IsString()
    @IsOptional()
    readonly description?: string;
}
