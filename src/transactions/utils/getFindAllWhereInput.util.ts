import { Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere, Like, IsNull } from 'typeorm';

import { Transaction } from '../../shared/entities/transaction.entity';

import { FindAllTransactionsDto } from '../dtos/find-all-transactions.dto';

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
    type,
    search,
    excludeAccountTransactions,
    excludeCategoryTransactions,
    from,
    to,
}: FindAllTransactionsDto): FindOptionsWhere<Transaction> => {
    const where: FindOptionsWhere<Transaction> = {
        type,
        user: userId ? { id: userId } : undefined,
        fromAccount: accountId ? { id: accountId } : undefined,
        toAccount: accountId ? { id: accountId } : undefined,
        fromCategory: transactionCategoryId ? { id: transactionCategoryId } : undefined,
        toCategory: transactionCategoryId ? { id: transactionCategoryId } : undefined,
        description: search ? Like(`%${search}%`) : undefined,
        createdAt: getCreatedAtFilter(from, to),
    };

    if (excludeAccountTransactions) {
        where.fromAccount = IsNull();
        where.toAccount = IsNull();
    }

    if (excludeCategoryTransactions) {
        where.fromCategory = IsNull();
        where.toCategory = IsNull();
    }

    return where;
};
