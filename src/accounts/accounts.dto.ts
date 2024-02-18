import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsNumber, IsEnum, IsOptional, IsPositive, Min } from 'class-validator';
import { PreloadAccountDto } from '../shared/dto/preload-account.dto';
import { EAccountStatus, EAccountType } from '../shared/enums/accounts.enums';

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
  @IsNumber()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(
  OmitType(PreloadAccountDto, ['balance', 'order']),
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

  @IsEnum(EAccountType)
  @IsOptional()
  readonly type?: EAccountType;

  @IsEnum(EAccountStatus)
  @IsOptional()
  readonly status?: EAccountStatus = EAccountStatus.ACTIVE;
}

export class ReorderAccountDto {
  @IsNumber()
  @Min(0)
  readonly order: number;
}
