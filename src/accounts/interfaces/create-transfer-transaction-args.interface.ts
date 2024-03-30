import { Account } from '../../shared/entities/account.entity';
import { User } from '../../shared/entities/user.entity';
import { ECurrency } from '../../shared/enums/currency.enums';

export interface ICreateTransferTransactionArgs {
    user: User;
    account: Account;
    value: number;
    updatedBalance: number;
    currency: ECurrency;
}
