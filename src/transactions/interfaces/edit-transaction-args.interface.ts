import { EditTransactionDto } from '../dtos/edit-transaction.dto';

export interface IEditTransactionArgs {
    id: number;
    editTransactionDto: EditTransactionDto;
    activeUserId: number;
}
