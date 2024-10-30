import { EditAccountCurrencyDto } from '../dtos/edit-account-currency.dto';

export interface IEditAccountCurrencyArgs {
    id: number;
    editAccountCurrencyDto: EditAccountCurrencyDto;
    activeUserId: number;
}
