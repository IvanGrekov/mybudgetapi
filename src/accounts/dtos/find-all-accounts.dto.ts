import { IsNumber as IsNumberBase, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

import { EAccountType, EAccountStatus } from 'shared/enums/account.enums';

export class FindAllAccountsDto {
    @Type(() => Number)
    @IsNumberBase()
    readonly userId: number;

    @IsEnum(EAccountType)
    @IsOptional()
    readonly type?: EAccountType;

    @IsEnum(EAccountStatus)
    @IsOptional()
    readonly status?: EAccountStatus;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly excludeId?: number;
}
