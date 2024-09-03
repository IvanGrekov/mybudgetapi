import { IsNumber as IsNumberBase, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationQueryDto } from '../../shared/dtos/pagination.dto';
import { ETransactionType } from '../../shared/enums/transaction.enums';

export class FindAllTransactionsDto extends PaginationQueryDto {
    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly userId?: number;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly accountId?: number;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly transactionCategoryId?: number;

    @IsEnum(ETransactionType)
    @IsOptional()
    readonly type?: ETransactionType;

    @IsOptional()
    readonly search?: string;

    @IsDateString()
    @IsOptional()
    readonly from?: string;

    @IsDateString()
    @IsOptional()
    readonly to?: string;
}
