import { BadRequestException } from '@nestjs/common';

type TValidateFindAllTransactionProperties = (args: {
    userId?: number;
    accountId?: number;
    transactionCategoryId?: number;
}) => void;

export const validateFindAllTransactionProperties: TValidateFindAllTransactionProperties = ({
    userId,
    accountId,
    transactionCategoryId,
}) => {
    if (!userId && !accountId && !transactionCategoryId) {
        throw new BadRequestException(
            'At least one of `userId`, `accountId` or `transactionCategoryId` must be provided',
        );
    }
};
