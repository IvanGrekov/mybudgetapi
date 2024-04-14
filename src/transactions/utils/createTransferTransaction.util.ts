import { BadRequestException } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';

import ArchivedEntityException from '../../shared/exceptions/archived-entity.exception';
import { getIdPointer } from '../../shared/utils/idPointer.utils';
import NotFoundException from '../../shared/exceptions/not-found.exception';
import { Transaction } from '../../shared/entities/transaction.entity';
import { User } from '../../shared/entities/user.entity';
import { Account } from '../../shared/entities/account.entity';
import { EAccountStatus } from '../../shared/enums/account.enums';

import { CreateTransactionDto } from '../dtos/create-transaction.dto';

type TValidateCreateTransferTransactionDto = (
    args: Pick<
        CreateTransactionDto,
        'userId' | 'fromAccountId' | 'toAccountId' | 'currencyRate'
    > & {
        fromAccount?: Account;
        toAccount?: Account;
    },
) => void;

const validateCreateTransferTransactionDto: TValidateCreateTransferTransactionDto = ({
    userId,
    fromAccountId,
    toAccountId,
    fromAccount,
    toAccount,
    currencyRate,
}) => {
    if (!fromAccount || !toAccount) {
        const notFoundId = fromAccount ? toAccountId : fromAccountId;
        throw new NotFoundException('Account', notFoundId);
    }

    const {
        user: fromAccountUser,
        status: fromAccountStatus,
        currency: fromAccountCurrency,
    } = fromAccount;
    const { user: toAccountUser, status: toAccountStatus, currency: toAccountCurrency } = toAccount;

    if (userId !== fromAccountUser.id) {
        throw new BadRequestException(
            `The \`fromAccount\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }
    if (userId !== toAccountUser.id) {
        throw new BadRequestException(
            `The \`toAccount\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }

    if (fromAccountStatus === EAccountStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `fromAccount`');
    }
    if (toAccountStatus === EAccountStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `toAccount`');
    }

    if (fromAccountCurrency !== toAccountCurrency && !currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided for Transaction between Accounts with different `currency`',
        );
    }
    if (fromAccountCurrency === toAccountCurrency && currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided only for Transaction between Accounts with different `currency`',
        );
    }
};

type TCreateTransferTransaction = ({
    createTransactionDto,
    findAccountById,
    saveAccount,
}: {
    createTransactionDto: CreateTransactionDto;
    findUserById(id: number): Promise<User>;
    findAccountById(options: FindOneOptions<Account>): Promise<Account>;
    saveAccount(entity: Account): Promise<Account>;
}) => Promise<Transaction>;

export const createTransferTransaction: TCreateTransferTransaction = async ({
    createTransactionDto: { userId, fromAccountId, toAccountId, currencyRate, value, description },
    findUserById,
    findAccountById,
    saveAccount,
}) => {
    const user = await findUserById(userId);

    const fromAccount = await findAccountById({
        where: { id: fromAccountId },
        relations: {
            user: true,
        },
    });
    const toAccount = await findAccountById({
        where: { id: toAccountId },
        relations: {
            user: true,
        },
    });

    validateCreateTransferTransactionDto({
        userId,
        fromAccountId,
        toAccountId,
        fromAccount,
        toAccount,
        currencyRate,
    });

    const currentFromAccountBalance = fromAccount.balance;
    const newFromAccountBalance = fromAccount.balance - value;
    const currentToAccountBalance = toAccount.balance;
    const newToAccountBalance = fromAccount.balance + value * (currencyRate || 1);

    currentFromAccountBalance;
    newFromAccountBalance;
    currentToAccountBalance;
    newToAccountBalance;

    user;
    description;
    saveAccount;

    // TODO: add queryRunner (IG)
    // TODO: update fromAccount balance (IG)
    // TODO: update toAccount balance (IG)
    // TODO: add fromAccountUpdatedBalance (IG)
    // TODO: add toAccountUpdatedBalance (IG)
    // TODO: add comission (IG)
    return {} as Transaction;
};
