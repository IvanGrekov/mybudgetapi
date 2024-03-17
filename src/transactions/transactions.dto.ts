import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

import { ECurrency } from '../shared/enums/currency.enums';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { ETransactionType } from '../shared/enums/transactions.enums';

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
}

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

export class EditTransactionDto extends PartialType(
  OmitType(CreateTransactionDto, ['userId']),
) {}

export class ValidateTransactionPropertiesDto extends EditTransactionDto {}
