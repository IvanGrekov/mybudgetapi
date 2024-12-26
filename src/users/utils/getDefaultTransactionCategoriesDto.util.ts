import { PreloadTransactionCategoryDto } from 'shared/dtos/preload-transaction-category.dto';
import { ECurrency } from 'shared/enums/currency.enums';
import { ELanguage } from 'shared/enums/language.enums';
import { ETransactionCategoryType } from 'shared/enums/transaction-category.enums';

type TGetTransactionCategoriesDto = (args: {
    currency: ECurrency;
    language: ELanguage;
}) => PreloadTransactionCategoryDto[];

const getIncomeTransactionCategoriesDto: TGetTransactionCategoriesDto = ({
    currency,
    language,
}) => {
    const isUa = language === ELanguage.UA;

    return [
        {
            name: isUa ? 'Зарплата' : 'Salary',
            type: ETransactionCategoryType.INCOME,
            currency,
            order: 0,
            iconName: 'upload',
        },
        {
            name: isUa ? 'Сторонній прибуток' : 'Other Income',
            type: ETransactionCategoryType.INCOME,
            currency,
            order: 1,
            iconName: 'top-arrow',
        },
    ];
};

const getExpenseTransactionCategoriesDto: TGetTransactionCategoriesDto = ({
    currency,
    language,
}) => {
    const isUa = language === ELanguage.UA;

    return [
        {
            name: isUa ? 'Житло' : 'Housing',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 0,
            iconName: 'home',
            children: [
                {
                    name: isUa ? 'Оренда' : 'Rent',
                    type: ETransactionCategoryType.EXPENSE,
                    currency,
                    order: 0,
                    iconName: 'hand-shaking',
                },
                {
                    name: isUa ? 'Комунальні послуги' : 'Utilities',
                    type: ETransactionCategoryType.EXPENSE,
                    currency,
                    order: 1,
                    iconName: 'checked-square',
                },
            ],
        },
        {
            name: isUa ? 'Покупки' : 'Shopping',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 1,
            iconName: 'cart',
        },
        {
            name: isUa ? 'Транспорт' : 'Transport',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 2,
            iconName: 'transport',
        },
        {
            name: isUa ? "Здоров'я" : 'Healthcare',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 3,
            iconName: 'health',
        },
        {
            name: isUa ? 'Особисті витрати' : 'Personal Expenses',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 4,
            iconName: 'beauty',
        },
        {
            name: isUa ? 'Кафе' : 'Cafe',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 5,
            iconName: 'food',
        },
        {
            name: isUa ? 'Підписки' : 'Subscriptions',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 6,
            iconName: 'subscription',
        },
        {
            name: isUa ? 'Хобі' : 'Hobbies',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 7,
            iconName: 'emotion',
        },
        {
            name: isUa ? 'Розваги' : 'Entertainment',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 8,
            iconName: 'entertainments',
        },
        {
            name: isUa ? 'Подорожі' : 'Travelings',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 9,
            iconName: 'car',
        },
        {
            name: isUa ? 'Подарунки' : 'Gifts',
            type: ETransactionCategoryType.EXPENSE,
            currency,
            order: 10,
            iconName: 'gift',
        },
    ];
};

export const getDefaultTransactionCategoriesDto: TGetTransactionCategoriesDto = (args) => {
    return [
        ...getIncomeTransactionCategoriesDto(args),
        ...getExpenseTransactionCategoriesDto(args),
    ];
};
