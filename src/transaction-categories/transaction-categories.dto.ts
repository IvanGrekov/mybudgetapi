import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsPositive,
  IsObject,
  IsArray,
} from 'class-validator';
import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import { QueryRunner } from 'typeorm';

import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import IsNumber from '../shared/property-decorators/is-number.decorator';
import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';
import {
  ETransactionCategoryType,
  ETransactionCategoryStatus,
} from '../shared/enums/transaction-categories.enums';

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

export class CreateTransactionCategoryDto extends OmitType(
  PreloadTransactionCategoryDto,
  ['order', 'children'],
) {
  @IsNumberBase()
  readonly userId: number;

  @IsNumberBase()
  @IsOptional()
  readonly parentId?: number;
}

export class EditTransactionCategoryDto extends PartialType(
  OmitType(CreateTransactionCategoryDto, ['userId', 'parentId', 'currency']),
) {
  @IsEnum(ETransactionCategoryStatus)
  @IsOptional()
  readonly status?: ETransactionCategoryStatus;
}

export class EditTransactionCategoryCurrencyDto extends PickType(
  PreloadTransactionCategoryDto,
  ['currency'],
) {
  @IsNumberBase()
  @IsPositive()
  readonly rate: number;
}

export class ReorderTransactionCategoryDto {
  @IsNumber()
  readonly order: number;

  @IsNumberBase()
  @IsOptional()
  readonly parentId?: number;
}

export class GetParentForNewTransactionCategoryDto extends PickType(
  CreateTransactionCategoryDto,
  ['parentId', 'userId', 'type'],
) {}

export class ArchiveTransactionCategoryDto {
  @IsNumberBase()
  readonly userId: number;

  @IsObject()
  transactionCategory: TransactionCategory;

  @IsObject()
  oldTransactionCategory: TransactionCategory;
}

export class SyncTransactionCategoriesOrderDto extends PickType(
  FindAllTransactionCategoriesDto,
  ['excludeId', 'parentId'],
) {
  @IsObject()
  readonly queryRunner: QueryRunner;

  @IsNumberBase()
  readonly userId: number;

  @IsEnum(ETransactionCategoryType)
  readonly type: ETransactionCategoryType;
}

export class UnassignChildrenFromParentDto {
  @IsNumberBase()
  readonly userId: number;

  @IsObject()
  readonly queryRunner: QueryRunner;

  @IsArray()
  @IsObject({ each: true })
  children: TransactionCategory[];
}
