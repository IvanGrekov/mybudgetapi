import { PreloadAccountDto } from '../dto/preload-account.dto';
import { EAccountType } from '../enums/accountType.enum';
import { ECurrency } from '../enums/currency.enum';

type TGetDefaultAccountsDto = (currency: ECurrency) => PreloadAccountDto[];

export const getDefaultAccountsDto: TGetDefaultAccountsDto = (currency) => {
  return [
    {
      currency,
      name: 'Cache',
      type: EAccountType.REGULAR,
      balance: 0,
    },
    {
      currency,
      name: 'Bank Account',
      type: EAccountType.REGULAR,
      balance: 0,
    },
    {
      currency,
      name: 'Savings',
      type: EAccountType.SAVINGS,
      balance: 0,
    },
  ];
};
