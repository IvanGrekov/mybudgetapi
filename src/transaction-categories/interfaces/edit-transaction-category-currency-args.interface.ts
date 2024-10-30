import { EditTransactionCategoryCurrencyDto } from '../dtos/edit-transaction-category-currency.dto';

export interface IEditTransactionCategoryCurrencyArgs {
    id: number;
    editTransactionCategoryCurrencyDto: EditTransactionCategoryCurrencyDto;
    activeUserId: number;
}
