import { PreloadAccountDto } from '../dto/preload-account.dto';
import { EAccountType } from '../enums/account-type.enum';
import { ECurrency } from '../enums/currency.enum';
import { ELanguage } from '../enums/language.enum';

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
    },
    {
      name: language === ELanguage.UA ? 'Банківський рахунок' : 'Bank Account',
      type: EAccountType.REGULAR,
      currency,
      balance: 0,
      shouldHideFromOverallBalance: false,
    },
    {
      name: language === ELanguage.UA ? 'Збереження' : 'Savings',
      type: EAccountType.SAVINGS,
      currency,
      balance: 0,
      shouldHideFromOverallBalance: true,
    },
  ];
};
