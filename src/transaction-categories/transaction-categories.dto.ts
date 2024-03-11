import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import { QueryRunner } from 'typeorm';

import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import IsNumber from '../shared/property-decorators/is-number.decorator';
import { PreloadTransactionCategoryDto } from '../shared/dto/preload-transaction-category.dto';
import {
  ETransactionCategoryType,
  ETransactionCategoryStatus,
} from '../shared/enums/transaction-categories.enums';

import { MAX_TRANSACTION_CATEGORIES_PER_USER } from './transaction-categories.constants';

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
) {}

export class ReorderTransactionCategoryDto {
  @IsNumberBase()
  readonly id: number;

  @IsNumber({
    max: MAX_TRANSACTION_CATEGORIES_PER_USER,
  })
  readonly order: number;
}

export class ReorderParentTransactionCategoryDto extends ReorderTransactionCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTransactionCategoryDto)
  @IsOptional()
  readonly childNodes?: ReorderTransactionCategoryDto[];
}

export class ReorderTransactionCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderParentTransactionCategoryDto)
  readonly parentNodes: ReorderParentTransactionCategoryDto[];
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
  @ValidateNested({ each: true })
  @Type(() => TransactionCategory)
  children: TransactionCategory[];
}

export class UpdateReorderingChild {
  @IsObject()
  readonly queryRunner: QueryRunner;

  @IsObject()
  readonly childNode: ReorderTransactionCategoryDto;

  @IsObject()
  readonly parentTransactionCategory: TransactionCategory;
}
