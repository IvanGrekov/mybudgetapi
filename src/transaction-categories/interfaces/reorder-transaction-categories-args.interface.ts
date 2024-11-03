import { ReorderTransactionCategoriesDto } from 'transaction-categories/dtos/reorder-transaction-categories.dto';

export interface IReorderTransactionCategoriesArgs {
    reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto;
    activeUserId: number;
}
