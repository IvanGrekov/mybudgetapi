import {
  IsEnum,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { DEFAULT_MAX_LENGTH } from '../shared/constants/string-fields.constants';
import { ECurrency } from '../shared/enums/currency.enums';

import { ETransactionCategoryType } from './transaction-categories.enums';

export class PreloadTransactionCategoryDto {
  @IsEnum(ETransactionCategoryType)
  readonly type: ETransactionCategoryType;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly order: number;

  @IsOptional()
  @IsNumber()
  readonly parentId?: number;
}

export class CreateTransactionCategoryDto extends PreloadTransactionCategoryDto {
  @IsNumber()
  readonly userId: number;
}

export class EditTransactionCategoryDto extends PartialType(
  PreloadTransactionCategoryDto,
) {}
