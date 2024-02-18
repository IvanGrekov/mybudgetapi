import { IsNumber, IsOptional, IsPositive } from 'class-validator';

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from '../constants/pagination.constants';

export class PaginationQueryDto {
  @IsNumber()
  @IsOptional()
  @IsPositive()
  readonly limit?: number = DEFAULT_LIMIT;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  readonly offset?: number = DEFAULT_OFFSET;
}
