export class PaginatedItemsResultDto<T> {
    items: T[];
    page: number;
    itemsPerPage: number;
    total: number;
}
