import { PreloadTransactionCategoryDto } from '../dto/preload-transaction-category.dto';
import { ECurrency } from '../enums/currency.enums';
import { ELanguage } from '../enums/language.enums';
import { ETransactionCategoryType } from '../enums/transaction-categories.enums';

type TGetTransactionCategoriesDto = (args: {
  currency: ECurrency;
  language: ELanguage;
}) => PreloadTransactionCategoryDto[];

const getIncomeTransactionCategoriesDto: TGetTransactionCategoriesDto = ({
  currency,
  language,
}) => {
  return [
    {
      name: language === ELanguage.UA ? 'Зарплата' : 'Salary',
      type: ETransactionCategoryType.INCOME,
      currency,
      order: 0,
    },
    {
      name: language === ELanguage.UA ? 'Сторонній прибуток' : 'Other Income',
      type: ETransactionCategoryType.INCOME,
      currency,
      order: 1,
    },
  ];
};

const getExpenseTransactionCategoriesDto: TGetTransactionCategoriesDto = ({
  currency,
  language,
}) => {
  return [
    {
      name: language === ELanguage.UA ? 'Житло' : 'Housing',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 0,
    },
    {
      name: language === ELanguage.UA ? 'Покупки' : 'Shopping',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 1,
    },
    {
      name: language === ELanguage.UA ? 'Кафе' : 'Cafe',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 2,
    },
    {
      name: language === ELanguage.UA ? 'Транспорт' : 'Transportation',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 3,
    },
    {
      name: language === ELanguage.UA ? "Здоров'я" : 'Healthcare',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 4,
    },
    {
      name:
        language === ELanguage.UA ? 'Особисті витрати' : 'Personal Expenses',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 5,
    },
    {
      name: language === ELanguage.UA ? 'Хобі' : 'Hobbies',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 6,
    },
    {
      name: language === ELanguage.UA ? 'Підписки' : 'Subscriptions',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 7,
    },
    {
      name: language === ELanguage.UA ? 'Розваги' : 'Entertainment',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 8,
    },
    {
      name: language === ELanguage.UA ? 'Подорожі' : 'Travelings',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 9,
    },
    {
      name: language === ELanguage.UA ? 'Подарунки' : 'Gifts',
      type: ETransactionCategoryType.EXPENSE,
      currency,
      order: 10,
    },
  ];
};

export const getDefaultTransactionCategoriesDto: TGetTransactionCategoriesDto =
  (args) => {
    return [
      ...getIncomeTransactionCategoriesDto(args),
      ...getExpenseTransactionCategoriesDto(args),
    ];
  };
