import { DeepPartial } from 'typeorm';

import { Account } from '../../shared/entities/account.entity';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { PreloadAccountDto } from '../../shared/dtos/preload-account.dto';
import { PreloadTransactionCategoryDto } from '../../shared/dtos/preload-transaction-category.dto';
import { ECurrency } from '../../shared/enums/currency.enums';
import { ELanguage } from '../../shared/enums/language.enums';

import { getDefaultAccountsDto } from './getDefaultAccountsDto.util';
import { getDefaultTransactionCategoriesDto } from './getDefaultTransactionCategoriesDto.util';

type TCreateAccount = (entityLike: DeepPartial<Account>) => Account;

type TPreloadAccount = (
    preloadAccountDto: PreloadAccountDto,
    createAccount: TCreateAccount,
) => Account;

type TCreateTransactionCategory = (
    entityLike: DeepPartial<TransactionCategory>,
) => TransactionCategory;

type TPreloadTransactionCategory = (
    preloadTransactionCategoryDto: PreloadTransactionCategoryDto,
    createTransactionCategory: TCreateTransactionCategory,
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

const preloadAccount: TPreloadAccount = (preloadAccountDto, createAccount) => {
    return createAccount({
        ...preloadAccountDto,
        initBalance: preloadAccountDto.balance,
    });
};

const preloadTransactionCategory: TPreloadTransactionCategory = (
    preloadTransactionCategoryDto,
    createTransactionCategory,
) => {
    return createTransactionCategory(preloadTransactionCategoryDto);
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
    }).map((accountDto) => preloadAccount(accountDto, createAccount));

    const transactionCategories = getDefaultTransactionCategoriesDto({
        currency,
        language,
    }).map((transactionCategory) =>
        preloadTransactionCategory(transactionCategory, createTransactionCategory),
    );

    return { accounts, transactionCategories };
};
