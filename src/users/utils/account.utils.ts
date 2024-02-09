import { PreloadAccountDto } from '../dto/preload-account.dto';
import { EAccountType } from '../enums/account-type.enum';
import { ECurrency } from '../enums/currency.enum';

type TGetDefaultAccountsDto = (currency: ECurrency) => PreloadAccountDto[];

export const getDefaultAccountsDto: TGetDefaultAccountsDto = (currency) => {
  return [
    {
      name: 'Cache',
      type: EAccountType.REGULAR,
      currency,
      balance: 0,
    },
    {
      name: 'Bank Account',
      type: EAccountType.REGULAR,
      currency,
      balance: 0,
    },
    {
      name: 'Savings',
      type: EAccountType.SAVINGS,
      currency,
      balance: 0,
    },
  ];
};
