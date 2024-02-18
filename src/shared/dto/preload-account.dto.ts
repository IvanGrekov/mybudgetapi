import {
  IsEnum,
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

import { DEFAULT_MAX_LENGTH } from '../constants/string-fields.constants';
import { ECurrency } from '../enums/currency.enums';
import { EAccountType } from '../enums/accounts.enums';

export class PreloadAccountDto {
  @MinLength(1)
  @MaxLength(DEFAULT_MAX_LENGTH)
  @IsString()
  readonly name: string;

  @IsEnum(EAccountType)
  readonly type: EAccountType;

  @IsEnum(ECurrency)
  readonly currency: ECurrency;

  @Min(0)
  @IsNumber()
  readonly balance: number;

  @IsOptional()
  @IsBoolean()
  readonly shouldHideFromOverallBalance?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly shouldShowAsIncome?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly shouldShowAsExpense?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly order?: number;
}
