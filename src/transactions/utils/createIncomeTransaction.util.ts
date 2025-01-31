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
import { validateNewToIOweAccountBalance } from 'transactions/utils/validateNewToIOweAccountBalance';

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

    const { user: toAccountUser, status: toAccountStatus, currency: toAccountCurrency } = toAccount;
    const {
        user: fromCategoryUser,
        status: fromCategoryStatus,
        currency: fromCategoryCurrency,
        type: fromCategoryType,
    } = fromCategory;

    if (userId !== fromCategoryUser.id) {
        throw new BadRequestException(
            `The \`fromCategory\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }
    if (userId !== toAccountUser.id) {
        throw new BadRequestException(
            `The \`toAccount\` doesn't belong to User ${getIdPointer(userId)}`,
        );
    }

    if (fromCategoryStatus === ETransactionCategoryStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `fromCategory`');
    }
    if (toAccountStatus === EAccountStatus.ARCHIVED) {
        throw new ArchivedEntityException('the `toAccount`');
    }

    if (fromCategoryCurrency !== toAccountCurrency && !currencyRate) {
        throw new BadRequestException(
            'The `currencyRate` must be provided for Transaction between TransactionCategory and Account with different `currency`',
        );
    }
    if (fromCategoryCurrency === toAccountCurrency && currencyRate) {
        throw new BadRequestException(
            'The `currencyRate` must be provided only for Transaction between TransactionCategory and Account with different `currency`',
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
    findAccountById(id: number): Promise<Account>;
    findTransactionCategoryById(id: number): Promise<TransactionCategory>;
}) => Promise<Transaction>;

export const createIncomeTransaction: TCreateIncomeTransaction = async ({
    createTransactionDto: {
        userId,
        toAccountId,
        fromCategoryId,
        currencyRate,
        value,
        fee,
        description,
    },
    queryRunner,
    getUserById,
    findAccountById,
    findTransactionCategoryById,
}) => {
    const user = await getUserById(userId);
    const toAccount = await findAccountById(toAccountId);
    const fromCategory = await findTransactionCategoryById(fromCategoryId);

    validateCreateIncomeTransactionDto({
        userId,
        toAccountId,
        fromCategoryId,
        currencyRate,
        toAccount,
        fromCategory,
    });

    const valueWithoutFee = (value - (fee || 0)) * (currencyRate || 1);
    let newToAccountBalance = toAccount.balance + valueWithoutFee;

    if (toAccount.type === EAccountType.I_OWE) {
        newToAccountBalance = toAccount.balance - (value + (fee || 0)) * (currencyRate || 1);
        validateNewToIOweAccountBalance(newToAccountBalance);
    }

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
            currency: fromCategory.currency,
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
