import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import { QueryRunner } from 'typeorm';

import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import IsString from '../shared/property-decorators/is-string.decorator';
import { ECurrency } from '../shared/enums/currency.enums';
import { ELanguage } from '../shared/enums/language.enums';

import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH } from './users.constants';

export class CreateUserDto {
  @IsString({
    minLength: NICKNAME_MIN_LENGTH,
    maxLength: NICKNAME_MAX_LENGTH,
  })
  readonly nickname: string;

  @IsEnum(ECurrency)
  readonly defaultCurrency: ECurrency;

  @IsEnum(ELanguage)
  readonly language: ELanguage;
}

export class EditUserDto extends PartialType(
  OmitType(CreateUserDto, ['defaultCurrency']),
) {}

export class EditUserCurrencyDto extends PickType(CreateUserDto, [
  'defaultCurrency',
]) {
  @IsNumber()
  @IsPositive()
  readonly rate: number;

  @IsBoolean()
  @IsOptional()
  readonly isForceCurrencyUpdate?: boolean;
}

export class DefaultRelationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Account)
  readonly accounts: Account[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionCategory)
  readonly transactionCategories: TransactionCategory[];
}

export class UpdateRelationsCurrencyDto extends PickType(EditUserCurrencyDto, [
  'rate',
  'isForceCurrencyUpdate',
]) {
  @IsObject()
  readonly queryRunner: QueryRunner;

  @IsNumber()
  readonly userId: number;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @IsEnum(ECurrency)
  readonly oldCurrency: ECurrency;
}
