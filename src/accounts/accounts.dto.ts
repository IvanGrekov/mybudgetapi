import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsPositive,
  IsBoolean,
  IsDefined,
} from 'class-validator';
import { QueryRunner } from 'typeorm';

import { Account } from '../shared/entities/account.entity';
import IsNumber from '../shared/property-decorators/is-number.decorator';
import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { EAccountType, EAccountStatus } from '../shared/enums/accounts.enums';

export class FindAllAccountsDto {
  @IsNumberBase()
  readonly userId: number;

  @IsEnum(EAccountType)
  @IsOptional()
  readonly type?: EAccountType;

  @IsEnum(EAccountStatus)
  @IsOptional()
  readonly status?: EAccountStatus;

  @IsNumberBase()
  @IsOptional()
  readonly excludeId?: number;
}

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
  @IsNumberBase()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['userId', 'balance', 'currency']),
) {
  @IsEnum(EAccountStatus)
  @IsOptional()
  readonly status?: EAccountStatus;
}

export class EditAccountCurrencyDto extends PickType(PreloadAccountDto, [
  'currency',
]) {
  @IsNumberBase()
  @IsPositive()
  readonly rate: number;
}

export class ReorderAccountDto {
  @IsNumber()
  readonly order: number;
}

export class ValidateAccountPropertiesDto {
  @IsEnum(EAccountType)
  @IsOptional()
  readonly type?: EAccountType;

  @IsBoolean()
  @IsOptional()
  readonly shouldShowAsIncome?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly shouldShowAsExpense?: boolean;
}

export class ArchiveAccountDto {
  @IsNumberBase()
  readonly userId: number;

  @IsEnum(EAccountType)
  readonly type: EAccountType;

  @IsDefined()
  readonly account: Account;
}

export class SyncAccountsOrderDto extends PickType(FindAllAccountsDto, [
  'excludeId',
]) {
  @IsDefined()
  readonly queryRunner: QueryRunner;

  @IsNumberBase()
  readonly userId: number;

  @IsEnum(EAccountType)
  readonly type: EAccountType;
}
