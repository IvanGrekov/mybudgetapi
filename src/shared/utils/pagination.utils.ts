import { PaginationQueryDto } from 'shared/dtos/pagination.dto';

export const calculateSkipOption = ({ offset, limit }: PaginationQueryDto): number => {
    return (offset - 1) * limit;
};
