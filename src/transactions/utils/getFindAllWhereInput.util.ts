import { Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere, Like, In } from 'typeorm';

import { Transaction } from 'shared/entities/transaction.entity';

import { FindAllTransactionsDto } from 'transactions/dtos/find-all-transactions.dto';

const getCreatedAtFilter = (from?: string, to?: string) => {
    if (from && to) {
        return Between(new Date(from), new Date(to));
    }

    if (from) {
        return MoreThanOrEqual(new Date(from));
    }

    if (to) {
        return LessThanOrEqual(new Date(to));
    }

    return undefined;
};

export const getFindAllWhereInput = ({
    userId,
    accountId,
    transactionCategoryId,
    types,
    search,
    from,
    to,
}: FindAllTransactionsDto): FindOptionsWhere<Transaction>[] => {
    const baseWhereOptions: FindOptionsWhere<Transaction> = {
        type: types ? In(types) : undefined,
        user: userId ? { id: userId } : undefined,
        description: search ? Like(`%${search}%`) : undefined,
        createdAt: getCreatedAtFilter(from, to),
    };

    const fromAccountWhereOptions: FindOptionsWhere<Transaction> = {
        ...baseWhereOptions,
        fromAccount: accountId ? { id: accountId } : undefined,
        toCategory: transactionCategoryId ? { id: transactionCategoryId } : undefined,
    };
    const toAccountWhereOptions: FindOptionsWhere<Transaction> = {
        ...baseWhereOptions,
        toAccount: accountId ? { id: accountId } : undefined,
        fromCategory: transactionCategoryId ? { id: transactionCategoryId } : undefined,
    };

    return [fromAccountWhereOptions, toAccountWhereOptions];
};
