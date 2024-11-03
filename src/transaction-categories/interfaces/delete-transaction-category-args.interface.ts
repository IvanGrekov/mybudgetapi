import { DeleteTransactionCategoryDto } from 'transaction-categories/dtos/delete-transaction-category.dto';

export interface IDeleteTransactionCategoryArgs {
    id: number;
    activeUserId: number;
    deleteTransactionCategoryDto: DeleteTransactionCategoryDto;
}
