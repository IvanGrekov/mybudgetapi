import { IsNumber as IsNumberBase, IsEnum, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { EAccountType, EAccountStatus } from 'shared/enums/account.enums';

export class FindAllAccountsDto {
    @Type(() => Number)
    @IsNumberBase()
    readonly userId: number;

    @Transform(({ value }) => value.split(','))
    @IsEnum(EAccountType, { each: true })
    @IsOptional()
    readonly types?: EAccountType[];

    @IsEnum(EAccountStatus)
    @IsOptional()
    readonly status?: EAccountStatus;

    @Type(() => Number)
    @IsNumberBase()
    @IsOptional()
    readonly excludeId?: number;
}
