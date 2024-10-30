import { ReorderTransactionCategoriesDto } from '../dtos/reorder-transaction-categories.dto';

export interface IReorderTransactionCategoriesArgs {
    reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto;
    activeUserId: number;
}
