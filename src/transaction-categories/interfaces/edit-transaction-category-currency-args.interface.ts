import { EditTransactionCategoryCurrencyDto } from 'transaction-categories/dtos/edit-transaction-category-currency.dto';

export interface IEditTransactionCategoryCurrencyArgs {
    id: number;
    editTransactionCategoryCurrencyDto: EditTransactionCategoryCurrencyDto;
    activeUserId: number;
}
