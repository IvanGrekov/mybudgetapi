import { PreloadAccountDto } from '../dto/preload-account.dto';
import { ECurrency } from '../enums/currency.enums';
import { ELanguage } from '../enums/language.enums';
import { EAccountType } from '../enums/accounts.enums';

type TGetDefaultAccountsDto = (args: {
  currency: ECurrency;
  language: ELanguage;
}) => PreloadAccountDto[];

export const getDefaultAccountsDto: TGetDefaultAccountsDto = ({
  currency,
  language,
}) => {
  return [
    {
      name: language === ELanguage.UA ? 'Готівка' : 'Cash',
      type: EAccountType.REGULAR,
      currency,
      balance: 0,
      shouldHideFromOverallBalance: false,
      order: 0,
    },
    {
      name: language === ELanguage.UA ? 'Банківський рахунок' : 'Bank Account',
      type: EAccountType.REGULAR,
      currency,
      balance: 0,
      shouldHideFromOverallBalance: false,
      order: 1,
    },
    {
      name: language === ELanguage.UA ? 'Збереження' : 'Savings',
      type: EAccountType.SAVINGS,
      currency,
      balance: 0,
      shouldHideFromOverallBalance: true,
      order: 0,
    },
  ];
};

export const getCalculateNewAccountBalance = (
  rate: number,
  isInitBalance?: boolean,
) => {
  const fieldName = isInitBalance ? 'initBalance' : 'balance';

  return () => `${fieldName} * ${rate}`;
};
