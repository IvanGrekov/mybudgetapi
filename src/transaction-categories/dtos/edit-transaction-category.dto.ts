import { IsEnum, IsOptional } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

import { ETransactionCategoryStatus } from '../../shared/enums/transaction-category.enums';

import { CreateTransactionCategoryDto } from './create-transaction-category.dto';

export class EditTransactionCategoryDto extends PartialType(
  OmitType(CreateTransactionCategoryDto, ['userId', 'parentId', 'currency']),
) {
  @IsEnum(ETransactionCategoryStatus)
  @IsOptional()
  readonly status?: ETransactionCategoryStatus;
}
