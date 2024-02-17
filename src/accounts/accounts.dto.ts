import { IsNumber, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { EAccountStatus, EAccountType } from '../shared/enums/accounts.enums';

export class CreateAccountDto extends PreloadAccountDto {
  @IsNumber()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(
  OmitType(PreloadAccountDto, ['balance']),
) {
  @IsOptional()
  @IsEnum(EAccountStatus)
  readonly status?: EAccountStatus;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  rate?: number;
}

export class FindAllAccountsDto {
  @IsNumber()
  readonly userId: number;

  @IsOptional()
  @IsEnum(EAccountType)
  readonly type?: EAccountType;

  @IsOptional()
  @IsEnum(EAccountStatus)
  readonly status: EAccountStatus = EAccountStatus.ACTIVE;
}
