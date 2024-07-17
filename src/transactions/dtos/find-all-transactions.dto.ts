import { IsNumber as IsNumberBase, IsEnum, IsOptional, IsDateString } from 'class-validator';

import { PaginationQueryDto } from '../../shared/dtos/pagination.dto';
import { ETransactionType } from '../../shared/enums/transaction.enums';

export class FindAllTransactionsDto extends PaginationQueryDto {
    @IsNumberBase()
    @IsOptional()
    readonly userId?: number;

    @IsNumberBase()
    @IsOptional()
    readonly accountId?: number;

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
