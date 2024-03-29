import { Account } from '../../shared/entities/account.entity';
import { EAccountType } from '../../shared/enums/account.enums';

export class IArchiveAccountArgs {
  userId: number;
  type: EAccountType;
  account: Account;
}
