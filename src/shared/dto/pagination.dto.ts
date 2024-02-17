import { IsOptional, IsPositive } from 'class-validator';

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from '../constants/pagination.constants';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  readonly limit: number = DEFAULT_LIMIT;

  @IsOptional()
  @IsPositive()
  readonly offset: number = DEFAULT_OFFSET;
}
