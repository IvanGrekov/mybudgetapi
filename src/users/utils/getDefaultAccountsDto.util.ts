import { PreloadAccountDto } from '../../shared/dtos/preload-account.dto';
import { ECurrency } from '../../shared/enums/currency.enums';
import { ELanguage } from '../../shared/enums/language.enums';
import { EAccountType } from '../../shared/enums/account.enums';

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
