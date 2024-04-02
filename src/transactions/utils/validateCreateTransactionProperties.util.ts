import { BadRequestException } from '@nestjs/common';

import { validateTransactionProperties } from './validateTransactionProperties.util';

type TValidateCreateTransactionProperties = (args: {
    fromAccountId?: number;
    fromCategoryId?: number;
    toAccountId?: number;
    toCategoryId?: number;
}) => void;

export const validateCreateTransactionProperties: TValidateCreateTransactionProperties = ({
    fromAccountId,
    toAccountId,
    fromCategoryId,
    toCategoryId,
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
};
