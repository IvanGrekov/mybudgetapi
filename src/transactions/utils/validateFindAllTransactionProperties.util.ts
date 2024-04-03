import { BadRequestException } from '@nestjs/common';

type TValidateFindAllTransactionProperties = (args: {
    userId?: number;
    accountId?: number;
    transactionCategoryId?: number;
    excludeAccountTransactions?: boolean;
    excludeCategoryTransactions?: boolean;
}) => void;

export const validateFindAllTransactionProperties: TValidateFindAllTransactionProperties = ({
    userId,
    accountId,
    transactionCategoryId,
    excludeAccountTransactions,
    excludeCategoryTransactions,
}) => {
    if (!userId && !accountId && !transactionCategoryId) {
        throw new BadRequestException(
            'At least one of `userId`, `accountId` or `transactionCategoryId` must be provided',
        );
    }

    if (accountId && excludeAccountTransactions) {
        throw new BadRequestException(
            'Cannot provide `accountId` and `excludeAccountTransactions` at the same time',
        );
    }

    if (transactionCategoryId && excludeCategoryTransactions) {
        throw new BadRequestException(
            'Cannot provide `transactionCategoryId` and `excludeCategoryTransactions` at the same time',
        );
    }
};
