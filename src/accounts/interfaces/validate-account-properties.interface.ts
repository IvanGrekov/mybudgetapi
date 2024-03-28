import { EAccountType } from '../../shared/enums/account.enums';

export interface IValidateAccountProperties {
  type?: EAccountType;
  shouldShowAsIncome?: boolean;
  shouldShowAsExpense?: boolean;
}
