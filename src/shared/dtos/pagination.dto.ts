import { IsInt, IsOptional, IsPositive } from 'class-validator';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../constants/pagination.constants';

export class PaginationQueryDto {
    @IsInt()
    @IsPositive()
    @IsOptional()
    readonly limit?: number = DEFAULT_LIMIT;

    @IsInt()
    @IsPositive()
    @IsOptional()
    readonly offset?: number = DEFAULT_OFFSET;
}
