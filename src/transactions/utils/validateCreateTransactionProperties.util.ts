import { BadRequestException } from '@nestjs/common';

import { validateTransactionProperties } from './validateTransactionProperties.util';
import { ETransactionType } from '../../shared/enums/transaction.enums';

interface ICreateTransactionBaseProperties {
    fromAccountId?: number;
    fromCategoryId?: number;
    toAccountId?: number;
    toCategoryId?: number;
}

type TValidateTransferType = (args: ICreateTransactionBaseProperties) => void;

type TValidateExpenseType = (args: ICreateTransactionBaseProperties) => void;

type TValidateIncomeType = (args: ICreateTransactionBaseProperties) => void;

type TValidateCreateTransactionProperties = (
    args: ICreateTransactionBaseProperties & {
        type: ETransactionType;
    },
) => void;

const validateTransferType: TValidateTransferType = ({
    fromAccountId,
    toAccountId,
    fromCategoryId,
    toCategoryId,
}): void => {
    if (fromAccountId === toAccountId) {
        throw new BadRequestException(
            'Transaction type `TRANSFER` requires different `fromAccountId` and `toAccountId`',
        );
    }

    if (fromCategoryId || toCategoryId) {
        throw new BadRequestException(
            'Transaction type `TRANSFER` does not allow `fromCategoryId` or `toCategoryId`',
        );
    }

    if (!fromAccountId || !toAccountId) {
        throw new BadRequestException(
            'Transaction type `TRANSFER` requires both `fromAccountId` and `toAccountId`',
        );
    }
};

const validateExpenseType: TValidateExpenseType = ({
    fromCategoryId,
    toAccountId,
    fromAccountId,
    toCategoryId,
}): void => {
    if (fromCategoryId) {
        throw new BadRequestException('Transaction type `EXPENSE` does not allow `fromCategoryId`');
    }

    if (toAccountId) {
        throw new BadRequestException('Transaction type `EXPENSE` does not allow `toAccountId`');
    }

    if (!fromAccountId) {
        throw new BadRequestException('Transaction type `EXPENSE` requires `fromAccountId`');
    }

    if (!toCategoryId) {
        throw new BadRequestException('Transaction type `EXPENSE` requires `toCategoryId`');
    }
};

const validateIncomeType: TValidateIncomeType = ({
    fromCategoryId,
    toAccountId,
    fromAccountId,
    toCategoryId,
}): void => {
    if (fromAccountId) {
        throw new BadRequestException('Transaction type `INCOME` does not allow `fromAccountId`');
    }

    if (toCategoryId) {
        throw new BadRequestException('Transaction type `INCOME` does not allow `toCategoryId`');
    }

    if (!fromCategoryId) {
        throw new BadRequestException('Transaction type `INCOME` requires `fromCategoryId`');
    }

    if (!toAccountId) {
        throw new BadRequestException('Transaction type `INCOME` requires `toAccountId`');
    }
};

export const validateCreateTransactionProperties: TValidateCreateTransactionProperties = ({
    fromAccountId,
    toAccountId,
    fromCategoryId,
    toCategoryId,
    type,
}) => {
    validateTransactionProperties({
        fromAccountId,
        toAccountId,
        fromCategoryId,
        toCategoryId,
    });

    if (!fromAccountId && !fromCategoryId) {
        throw new BadRequestException(
            'Transaction must have either `fromAccountId` or `fromCategoryId`',
        );
    }

    if (!toAccountId && !toCategoryId) {
        throw new BadRequestException(
            'Transaction must have either `toAccountId` or `toCategoryId`',
        );
    }

    if (type === ETransactionType.BALANCE_CORRECTION) {
        throw new BadRequestException(
            'Transaction type `BALANCE_CORRECTION` is not allowed for creation',
        );
    }

    if (type === ETransactionType.TRANSFER) {
        return validateTransferType({
            fromAccountId,
            fromCategoryId,
            toAccountId,
            toCategoryId,
        });
    }

    if (type === ETransactionType.EXPENSE) {
        return validateExpenseType({
            fromAccountId,
            fromCategoryId,
            toAccountId,
            toCategoryId,
        });
    }

    if (type === ETransactionType.INCOME) {
        return validateIncomeType({
            fromAccountId,
            fromCategoryId,
            toAccountId,
            toCategoryId,
        });
    }
};
