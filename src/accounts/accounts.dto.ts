import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  IsNumber as IsNumberBase,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';

import IsNumber from '../shared/property-decorators/is-number.decorator';
import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { EAccountStatus, EAccountType } from '../shared/enums/accounts.enums';

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
  @IsNumberBase()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(
  OmitType(PreloadAccountDto, ['balance', 'order']),
) {
  @IsEnum(EAccountStatus)
  @IsOptional()
  readonly status?: EAccountStatus;

  @IsNumberBase()
  @IsPositive()
  @IsOptional()
  rate?: number;
}

export class FindAllAccountsDto {
  @IsNumberBase()
  readonly userId: number;

  @IsEnum(EAccountType)
  @IsOptional()
  readonly type?: EAccountType;

  @IsEnum(EAccountStatus)
  @IsOptional()
  readonly status?: EAccountStatus = EAccountStatus.ACTIVE;
}

export class ReorderAccountDto {
  @IsNumber()
  readonly order: number;
}
