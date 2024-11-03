import { EditAccountCurrencyDto } from 'accounts/dtos/edit-account-currency.dto';

export interface IEditAccountCurrencyArgs {
    id: number;
    editAccountCurrencyDto: EditAccountCurrencyDto;
    activeUserId: number;
}
