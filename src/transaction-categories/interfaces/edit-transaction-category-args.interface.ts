import { EditTransactionCategoryDto } from '../dtos/edit-transaction-category.dto';

export interface IEditTransactionCategoryArgs {
    id: number;
    editTransactionCategoryDto: EditTransactionCategoryDto;
    activeUserId: number;
}
