import { PreloadAccountDto } from 'shared/dtos/preload-account.dto';
import { ECurrency } from 'shared/enums/currency.enums';
import { ELanguage } from 'shared/enums/language.enums';
import { EAccountType } from 'shared/enums/account.enums';

type TGetDefaultAccountsDto = (args: {
    currency: ECurrency;
    language: ELanguage;
}) => PreloadAccountDto[];

export const getDefaultAccountsDto: TGetDefaultAccountsDto = ({ currency, language }) => {
    const isUa = language === ELanguage.UA;

    return [
        {
            name: isUa ? 'Готівка' : 'Cash',
            type: EAccountType.REGULAR,
            currency,
            balance: 0,
            shouldHideFromOverallBalance: false,
            order: 0,
        },
        {
            name: isUa ? 'Банківський рахунок' : 'Bank Account',
            type: EAccountType.REGULAR,
            currency,
            balance: 0,
            shouldHideFromOverallBalance: false,
            order: 1,
        },
        {
            name: isUa ? 'Збереження' : 'Savings',
            type: EAccountType.SAVINGS,
            currency,
            balance: 100,
            shouldHideFromOverallBalance: false,
            order: 0,
        },
    ];
};
