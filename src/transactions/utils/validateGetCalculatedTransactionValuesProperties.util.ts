import { BadRequestException } from '@nestjs/common';
import { GetCalculatedTransactionValuesDto } from 'transactions/dtos/get-calculated-transaction-values.dto';

type TValidateFindAllTransactionProperties = (
    args: Pick<GetCalculatedTransactionValuesDto, 'accountId' | 'transactionCategoryId'>,
) => void;

export const validateGetCalculatedTransactionValuesProperties: TValidateFindAllTransactionProperties =
    ({ accountId, transactionCategoryId }) => {
        if (!accountId && !transactionCategoryId) {
            throw new BadRequestException(
                'Either `accountId` or `transactionCategoryId` must be provided to calculate transactions',
            );
        }

        if (accountId && transactionCategoryId) {
            throw new BadRequestException(
                'Only one of `accountId` or `transactionCategoryId` can be provided to calculate transactions',
            );
        }
    };
