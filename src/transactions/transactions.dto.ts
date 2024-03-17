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
  readonly userId: number;

  @IsNumberBase()
  readonly accountId: number;

  @IsNumberBase()
  readonly transactionCategoryId: number;

  @IsEnum(ETransactionType)
  @IsOptional()
  readonly type?: ETransactionType;
}

export class CreateTransactionDto {
  @IsNumberBase()
  readonly userId: number;

  @IsNumberBase()
  readonly fromAccountId: number;

  @IsNumberBase()
  readonly toAccountId: number;

  @IsNumberBase()
  readonly fromCategoryId: number;

  @IsNumberBase()
  readonly toCategoryId: number;

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
