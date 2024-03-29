import { EAccountType } from '../../shared/enums/account.enums';

export interface IValidateAccountPropertiesArgs {
  type?: EAccountType;
  shouldShowAsIncome?: boolean;
  shouldShowAsExpense?: boolean;
}
