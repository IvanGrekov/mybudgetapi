import { PartialType, OmitType, PickType } from '@nestjs/mapped-types';
import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';

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
}

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
  @IsNumberBase()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(
  OmitType(PreloadAccountDto, ['balance', 'order', 'currency']),
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
  rate: number;
}

export class ReorderAccountDto {
  @IsNumber()
  readonly order: number;
}
