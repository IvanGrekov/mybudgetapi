import { BadRequestException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

import ArchivedEntityException from 'shared/exceptions/archived-entity.exception';
import NotFoundException from 'shared/exceptions/not-found.exception';
import { getIdPointer } from 'shared/utils/idPointer.utils';
import { Transaction } from 'shared/entities/transaction.entity';
import { User } from 'shared/entities/user.entity';
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { EAccountStatus, EAccountType } from 'shared/enums/account.enums';
import {
    ETransactionCategoryStatus,
    ETransactionCategoryType,
} from 'shared/enums/transaction-category.enums';
import { ETransactionType } from 'shared/enums/transaction.enums';

import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';

type TValidateCreateExpenseTransactionDto = (
    args: Pick<CreateTransactionDto, 'userId' | 'fromAccountId' | 'toCategoryId'> & {
        fromAccount?: Account;
        toCategory?: TransactionCategory;
    },
) => void;

const validateCreateExpenseTransactionDto: TValidateCreateExpenseTransactionDto = ({
    userId,
    fromAccountId,
    toCategoryId,
    fromAccount,
    toCategory,
}) => {
    if (!fromAccount || !toCategory) {
        const notFoundId = fromAccount ? toCategoryId : fromAccountId;
        const model = fromAccount ? 'TransactionCategory' : 'Account';
        throw new NotFoundException(model, notFoundId);
    }

    const { user: fromAccountUser, status: fromAccountStatus, type: fromAccountType } = fromAccount;
    const { user: toCategoryUser, status: toCategoryStatus, type: toCategoryType } = toCategory;

    if (userId !== fromAccountUser.id) {
        throw new BadRequestException(
            `The \`fromAccount\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }
    if (userId !== toCategoryUser.id) {
        throw new BadRequestException(
            `The \`toCategory\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }

    if (fromAccountStatus === EAccountStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `fromAccount`');
    }
    if (toCategoryStatus === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `toCategory`');
    }

    if (fromAccountType === EAccountType.I_OWE) {
        throw new BadRequestException(
            'The `fromAccount` must not be of type `I_OWE` for Expense Transaction',
        );
    }
    if (toCategoryType !== ETransactionCategoryType.EXPENSE) {
        throw new BadRequestException(
            'The `toCategory` must be of type `EXPENSE` for Expense Transaction',
        );
    }
};

type TCreateExpenseTransaction = (args: {
    createTransactionDto: CreateTransactionDto;
    queryRunner: QueryRunner;
    getUserById(id: number): Promise<User>;
    findAccountById(id: number): Promise<Account>;
    findTransactionCategoryById(id: number): Promise<TransactionCategory>;
}) => Promise<Transaction>;

export const createExpenseTransaction: TCreateExpenseTransaction = async ({
    createTransactionDto: { userId, fromAccountId, toCategoryId, value, fee, description },
    queryRunner,
    getUserById,
    findAccountById,
    findTransactionCategoryById,
}) => {
    const user = await getUserById(userId);
    const fromAccount = await findAccountById(fromAccountId);
    const toCategory = await findTransactionCategoryById(toCategoryId);

    validateCreateExpenseTransactionDto({
        userId,
        fromAccountId,
        toCategoryId,
        fromAccount,
        toCategory,
    });

    const newFromAccountBalance = fromAccount.balance - value - (fee || 0);

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        queryRunner.manager.update(Account, fromAccountId, { balance: newFromAccountBalance });

        const transactionTemplate = queryRunner.manager.create(Transaction, {
            user,
            fromAccount,
            fromAccountUpdatedBalance: newFromAccountBalance,
            toCategory,
            type: ETransactionType.EXPENSE,
            value,
            fee,
            description,
            currency: fromAccount.currency,
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
