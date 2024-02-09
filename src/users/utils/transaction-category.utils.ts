import { PreloadTransactionCategoryDto } from '../dto/preload-transaction-category.dto';
import { ETransactionCategoryType } from '../enums/transaction-category-type.enum';
import { ECurrency } from '../enums/currency.enum';

type TGetTransactionCategoriesDto = (
  currency: ECurrency,
) => PreloadTransactionCategoryDto[];

const getIncomeTransactionCategoriesDto: TGetTransactionCategoriesDto = (
  currency,
) => {
  return [
    {
      name: 'Salary Income',
      type: ETransactionCategoryType.INCOME,
      currency,
      order: 0,
    },
    {
      name: 'Other Income',
      type: ETransactionCategoryType.INCOME,
      currency,
      order: 1,
    },
  ];
};

const getExpenseTransactionCategoriesDto: TGetTransactionCategoriesDto = (
  currency,
) => {
  return [
    {
      name: 'Housing',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 0,
    },
    {
      name: 'Shopping',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 1,
    },
    {
      name: 'Cafe',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 2,
    },
    {
      name: 'Transportation',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 3,
    },
    {
      name: 'Healthcare',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 4,
    },
    {
      name: 'Personal Expenses',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 5,
    },
    {
      name: 'Hobbies',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 6,
    },
    {
      name: 'Subscriptions',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 7,
    },
    {
      name: 'Entertainment',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 8,
    },
    {
      name: 'Gifts',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 9,
    },
  ];
};

export const getDefaultTransactionCategoriesDto: TGetTransactionCategoriesDto =
  (currency) => {
    return [
      ...getIncomeTransactionCategoriesDto(currency),
      ...getExpenseTransactionCategoriesDto(currency),
    ];
  };
