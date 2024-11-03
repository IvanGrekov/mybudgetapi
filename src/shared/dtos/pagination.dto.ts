import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from 'shared/constants/pagination.constants';

export class PaginationQueryDto {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsOptional()
    readonly limit?: number = DEFAULT_LIMIT;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsOptional()
    readonly offset?: number = DEFAULT_OFFSET;
}
