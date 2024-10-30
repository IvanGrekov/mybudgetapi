import { DeleteTransactionCategoryDto } from '../dtos/delete-transaction-category.dto';

export interface IDeleteTransactionCategoryArgs {
    id: number;
    activeUserId: number;
    deleteTransactionCategoryDto: DeleteTransactionCategoryDto;
}
