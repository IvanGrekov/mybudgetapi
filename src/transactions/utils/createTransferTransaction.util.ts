import { BadRequestException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

import ArchivedEntityException from 'shared/exceptions/archived-entity.exception';
import NotFoundException from 'shared/exceptions/not-found.exception';
import { getIdPointer } from 'shared/utils/idPointer.utils';
import { Transaction } from 'shared/entities/transaction.entity';
import { User } from 'shared/entities/user.entity';
import { Account } from 'shared/entities/account.entity';
import { EAccountStatus, EAccountType } from 'shared/enums/account.enums';
import { ETransactionType } from 'shared/enums/transaction.enums';

import { validateNewFromAccountBalance } from 'transactions/utils/validateNewFromAccountBalance.util';
import { validateNewToIOweAccountBalance } from 'transactions/utils/validateNewToIOweAccountBalance.util';
import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';

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
    currencyRate,
    fromAccount,
    toAccount,
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
            'The `currencyRate` must be provided for Transaction between Accounts with different `currency`',
        );
    }
    if (fromAccountCurrency === toAccountCurrency && currencyRate) {
        throw new BadRequestException(
            'The `currencyRate` must be provided only for Transaction between Accounts with different `currency`',
        );
    }
};

type TCreateTransferTransaction = (args: {
    createTransactionDto: CreateTransactionDto;
    queryRunner: QueryRunner;
    getUserById(id: number): Promise<User>;
    findAccountById(id: number): Promise<Account>;
}) => Promise<Transaction>;

export const createTransferTransaction: TCreateTransferTransaction = async ({
    createTransactionDto: {
        userId,
        fromAccountId,
        toAccountId,
        currencyRate,
        value,
        fee,
        description,
    },
    queryRunner,
    getUserById,
    findAccountById,
}) => {
    const user = await getUserById(userId);
    const fromAccount = await findAccountById(fromAccountId);
    const toAccount = await findAccountById(toAccountId);

    validateCreateTransferTransactionDto({
        userId,
        fromAccountId,
        toAccountId,
        currencyRate,
        fromAccount,
        toAccount,
    });

    let newFromAccountBalance = fromAccount.balance - value - (fee || 0);

    if (fromAccount.type === EAccountType.I_OWE) {
        newFromAccountBalance = fromAccount.balance + value + (fee || 0);
    }

    validateNewFromAccountBalance(newFromAccountBalance);

    let newToAccountBalance = toAccount.balance + value * (currencyRate || 1);

    if (toAccount.type === EAccountType.I_OWE) {
        newToAccountBalance = toAccount.balance - value * (currencyRate || 1);
        validateNewToIOweAccountBalance(newToAccountBalance);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        await queryRunner.manager.update(Account, fromAccountId, {
            balance: newFromAccountBalance,
        });
        await queryRunner.manager.update(Account, toAccountId, { balance: newToAccountBalance });

        const transactionTemplate = await queryRunner.manager.create(Transaction, {
            user,
            fromAccount,
            fromAccountUpdatedBalance: newFromAccountBalance,
            toAccount,
            toAccountUpdatedBalance: newToAccountBalance,
            type: ETransactionType.TRANSFER,
            value,
            fee,
            description,
            currency: fromAccount.currency,
            currencyRate,
        });
        const transaction = await queryRunner.manager.save(Transaction, transactionTemplate);

        await queryRunner.commitTransaction();

        return transaction;
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};
