import {
  IsEnum,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { DEFAULT_MAX_LENGTH } from '../shared/constants/string-fields.constants';
import { ECurrency } from '../shared/enums/currency.enums';

import { EAccountType } from './accounts.enums';

export class PreloadAccountDto {
  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @IsEnum(EAccountType)
  readonly type: EAccountType;

  @IsNumber()
  readonly balance: number;

  @IsBoolean()
  readonly shouldHideFromOverallBalance: boolean;

  @IsOptional()
  @IsBoolean()
  readonly shouldShowAsIncome?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly shouldShowAsExpense?: boolean;
}

export class CreateAccountDto extends PreloadAccountDto {
  @IsNumber()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(PreloadAccountDto) {}
