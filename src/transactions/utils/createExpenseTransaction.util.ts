import { BadRequestException } from '@nestjs/common';
import { FindOneOptions, QueryRunner } from 'typeorm';

import ArchivedEntityException from '../../shared/exceptions/archived-entity.exception';
import NotFoundException from '../../shared/exceptions/not-found.exception';
import { getIdPointer } from '../../shared/utils/idPointer.utils';
import { Transaction } from '../../shared/entities/transaction.entity';
import { User } from '../../shared/entities/user.entity';
import { Account } from '../../shared/entities/account.entity';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';
import { EAccountStatus, EAccountType } from '../../shared/enums/account.enums';
import {
    ETransactionCategoryStatus,
    ETransactionCategoryType,
} from '../../shared/enums/transaction-category.enums';
import { ETransactionType } from '../../shared/enums/transaction.enums';

import { CreateTransactionDto } from '../dtos/create-transaction.dto';

type TValidateCreateExpenseTransactionDto = (
    args: Pick<
        CreateTransactionDto,
        'userId' | 'fromAccountId' | 'toCategoryId' | 'currencyRate'
    > & {
        fromAccount?: Account;
        toCategory?: TransactionCategory;
    },
) => void;

const validateCreateExpenseTransactionDto: TValidateCreateExpenseTransactionDto = ({
    userId,
    fromAccountId,
    toCategoryId,
    currencyRate,
    fromAccount,
    toCategory,
}) => {
    if (!fromAccount || !toCategory) {
        const notFoundId = fromAccount ? toCategoryId : fromAccountId;
        const model = fromAccount ? 'TransactionCategory' : 'Account';
        throw new NotFoundException(model, notFoundId);
    }

    const {
        user: fromAccountUser,
        status: fromAccountStatus,
        currency: fromAccountCurrency,
        type: fromAccountType,
    } = fromAccount;
    const {
        user: toCategoryUser,
        status: toCategoryStatus,
        currency: toCategoryCurrency,
        type: toCategoryType,
    } = toCategory;

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

    if (fromAccountCurrency !== toCategoryCurrency && !currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided for Transaction between Account and TransactionCategory with different `currency`',
        );
    }
    if (fromAccountCurrency === toCategoryCurrency && currencyRate) {
        throw new BadRequestException(
            'The `rate` must be provided only for Transaction between Account and TransactionCategory with different `currency`',
        );
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
    findUserById(id: number): Promise<User>;
    findAccountById(options: FindOneOptions<Account>): Promise<Account>;
    findTransactionCategoryById(
        options: FindOneOptions<TransactionCategory>,
    ): Promise<TransactionCategory>;
}) => Promise<Transaction>;

export const createExpenseTransaction: TCreateExpenseTransaction = async ({
    createTransactionDto: {
        userId,
        fromAccountId,
        toCategoryId,
        currencyRate,
        value,
        fee = 0,
        description,
    },
    queryRunner,
    findUserById,
    findAccountById,
    findTransactionCategoryById,
}) => {
    const user = await findUserById(userId);
    const fromAccount = await findAccountById({
        where: { id: fromAccountId },
        relations: {
            user: true,
        },
    });
    const toCategory = await findTransactionCategoryById({
        where: { id: toCategoryId },
        relations: {
            user: true,
        },
    });

    validateCreateExpenseTransactionDto({
        userId,
        fromAccountId,
        toCategoryId,
        currencyRate,
        fromAccount,
        toCategory,
    });

    const newFromAccountBalance = fromAccount.balance - value - fee;

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
            currencyRate,
        });
        const transaction = await queryRunner.manager.save(Transaction, transactionTemplate);

        return transaction;
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};
