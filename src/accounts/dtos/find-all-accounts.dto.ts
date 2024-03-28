import { IsNumber as IsNumberBase, IsEnum, IsOptional } from 'class-validator';

import { EAccountType, EAccountStatus } from '../../shared/enums/account.enums';

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
