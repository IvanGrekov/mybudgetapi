import { EditTransactionDto } from 'transactions/dtos/edit-transaction.dto';

export interface IEditTransactionArgs {
    id: number;
    editTransactionDto: EditTransactionDto;
    activeUserId: number;
}
