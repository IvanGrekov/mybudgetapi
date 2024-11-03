import { EditAccountDto } from 'accounts/dtos/edit-account.dto';

export interface IEditAccountArgs {
    id: number;
    editAccountDto: EditAccountDto;
    activeUserId: number;
}
