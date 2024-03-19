import { IsNumber, IsOptional, IsPositive } from 'class-validator';

import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from '../constants/pagination.constants';

export class PaginationQueryDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly limit?: number = DEFAULT_LIMIT;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  readonly offset?: number = DEFAULT_OFFSET;
}
