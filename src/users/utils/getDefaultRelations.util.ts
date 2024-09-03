import { DeepPartial } from 'typeorm';

import { Account } from '../../shared/entities/account.entity';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { ECurrency } from '../../shared/enums/currency.enums';
import { ELanguage } from '../../shared/enums/language.enums';

import { getDefaultAccountsDto } from './getDefaultAccountsDto.util';
import { getDefaultTransactionCategoriesDto } from './getDefaultTransactionCategoriesDto.util';

type TCreateAccount = (entityLike: DeepPartial<Account>) => Account;

type TCreateTransactionCategory = (
    entityLike: DeepPartial<TransactionCategory>,
) => TransactionCategory;

type TGetDefaultRelations = (args: {
    currency: ECurrency;
    language: ELanguage;
    createAccount: TCreateAccount;
    createTransactionCategory: TCreateTransactionCategory;
}) => {
    accounts: Account[];
    transactionCategories: TransactionCategory[];
};

export const getDefaultRelations: TGetDefaultRelations = ({
    currency,
    language,
    createAccount,
    createTransactionCategory,
}) => {
    const accounts = getDefaultAccountsDto({
        currency,
        language,
    }).map((accountDto) =>
        createAccount({
            ...accountDto,
            initBalance: accountDto.balance,
        }),
    );

    const transactionCategories = getDefaultTransactionCategoriesDto({
        currency,
        language,
    }).map((transactionCategory) => createTransactionCategory(transactionCategory));

    return { accounts, transactionCategories };
};
