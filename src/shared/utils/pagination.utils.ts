import { PaginationQueryDto } from '../dto/pagination.dto';

export const calculateSkipOption = ({
  offset,
  limit,
}: PaginationQueryDto): number => {
  return (offset - 1) * limit;
};
