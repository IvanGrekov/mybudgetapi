import {
    IsNumber as IsNumberBase,
    IsEnum,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

import { ECurrency } from '../../shared/enums/currency.enums';
import { ETransactionType } from '../../shared/enums/transaction.enums';

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

    @IsEnum(ECurrency)
    readonly currency: ECurrency;

    @IsString()
    @IsOptional()
    readonly description?: string;
}
