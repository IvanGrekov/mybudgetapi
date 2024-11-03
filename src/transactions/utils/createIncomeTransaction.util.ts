import { BadRequestException } from '@nestjs/common';
import { FindOneOptions, QueryRunner } from 'typeorm';

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

type TValidateCreateIncomeTransactionDto = (
    args: Pick<
        CreateTransactionDto,
        'userId' | 'toAccountId' | 'fromCategoryId' | 'currencyRate'
    > & {
        toAccount?: Account;
        fromCategory?: TransactionCategory;
    },
) => void;

const validateCreateIncomeTransactionDto: TValidateCreateIncomeTransactionDto = ({
    userId,
    toAccountId,
    fromCategoryId,
    currencyRate,
    toAccount,
    fromCategory,
}) => {
    if (!toAccount || !fromCategory) {
        const notFoundId = toAccount ? fromCategoryId : toAccountId;
        const model = toAccount ? 'TransactionCategory' : 'Account';
        throw new NotFoundException(model, notFoundId);
    }

    const {
        user: toAccountUser,
        status: toAccountStatus,
        currency: toAccountCurrency,
        type: toAccountType,
    } = toAccount;
    const {
        user: fromCategoryUser,
        status: fromCategoryStatus,
        currency: fromCategoryCurrency,
        type: fromCategoryType,
    } = fromCategory;

    if (userId !== toAccountUser.id) {
        throw new BadRequestException(
            `The \`toAccount\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }
    if (userId !== fromCategoryUser.id) {
        throw new BadRequestException(
            `The \`fromCategory\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }

    if (toAccountStatus === EAccountStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `toAccount`');
    }
    if (fromCategoryStatus === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `fromCategory`');
    }

    if (toAccountCurrency !== fromCategoryCurrency && !currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided for Transaction between Account and TransactionCategory with different `currency`',
        );
    }
    if (toAccountCurrency === fromCategoryCurrency && currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided only for Transaction between Account and TransactionCategory with different `currency`',
        );
    }

    if (toAccountType === EAccountType.I_OWE) {
        throw new BadRequestException(
            'The `toAccount` must not be of type `I_OWE` for Income Transaction',
        );
    }
    if (toAccountType === EAccountType.OWE_ME) {
        throw new BadRequestException(
            'The `toAccount` must not be of type `OWE_ME` for Income Transaction',
        );
    }
    if (fromCategoryType !== ETransactionCategoryType.INCOME) {
        throw new BadRequestException(
            'The `fromCategory` must be of type `INCOME` for Income Transaction',
        );
    }
};

type TCreateIncomeTransaction = (args: {
    createTransactionDto: CreateTransactionDto;
    queryRunner: QueryRunner;
    getUserById(id: number): Promise<User>;
    findAccountById(options: FindOneOptions<Account>): Promise<Account>;
    findTransactionCategoryById(
        options: FindOneOptions<TransactionCategory>,
    ): Promise<TransactionCategory>;
}) => Promise<Transaction>;

export const createIncomeTransaction: TCreateIncomeTransaction = async ({
    createTransactionDto: {
        userId,
        toAccountId,
        fromCategoryId,
        currencyRate,
        value,
        fee = 0,
        description,
    },
    queryRunner,
    getUserById,
    findAccountById,
    findTransactionCategoryById,
}) => {
    const user = await getUserById(userId);
    const toAccount = await findAccountById({
        where: { id: toAccountId },
        relations: {
            user: true,
        },
    });
    const fromCategory = await findTransactionCategoryById({
        where: { id: fromCategoryId },
        relations: {
            user: true,
        },
    });

    validateCreateIncomeTransactionDto({
        userId,
        toAccountId,
        fromCategoryId,
        currencyRate,
        toAccount,
        fromCategory,
    });

    const newToAccountBalance = toAccount.balance + value - fee;

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        queryRunner.manager.update(Account, toAccountId, { balance: newToAccountBalance });

        const transactionTemplate = queryRunner.manager.create(Transaction, {
            user,
            toAccount,
            toAccountUpdatedBalance: newToAccountBalance,
            fromCategory,
            type: ETransactionType.INCOME,
            value,
            fee,
            description,
            currency: toAccount.currency,
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
