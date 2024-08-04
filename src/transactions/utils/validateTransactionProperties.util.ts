import { BadRequestException } from '@nestjs/common';

type TValidateTransactionProperties = (args: {
    fromAccountId?: number;
    fromCategoryId?: number;
    toAccountId?: number;
    toCategoryId?: number;
}) => void;

export const validateTransactionProperties: TValidateTransactionProperties = ({
    fromAccountId,
    fromCategoryId,
    toAccountId,
    toCategoryId,
}) => {
    if (fromAccountId && fromCategoryId) {
        throw new BadRequestException(
            'Transaction cannot have both `fromAccountId` and `fromCategoryId`',
        );
    }

    if (toAccountId && toCategoryId) {
        throw new BadRequestException(
            'Transaction cannot have both `toAccountId` and `toCategoryId`',
        );
    }
};
