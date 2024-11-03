import { IsEnum, IsOptional } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/swagger';

import { ETransactionCategoryStatus } from 'shared/enums/transaction-category.enums';

import { CreateTransactionCategoryDto } from 'transaction-categories/dtos/create-transaction-category.dto';

export class EditTransactionCategoryDto extends PartialType(
    OmitType(CreateTransactionCategoryDto, ['type', 'userId', 'parentId', 'currency']),
) {
    @IsEnum(ETransactionCategoryStatus)
    @IsOptional()
    readonly status?: ETransactionCategoryStatus;
}
