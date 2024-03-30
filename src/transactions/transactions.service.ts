import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository, FindOptionsWhere } from 'typeorm';
import { calculateSkipOption } from '../shared/utils/pagination.utils';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { Transaction } from '../shared/entities/transaction.entity';

import { FindAllTransactionsDto } from './dtos/find-all-transactions.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { EditTransactionDto } from './dtos/edit-transaction.dto';
import { IValidateTransactionPropertiesArgs } from './interfaces/validate-transaction-properties-args.interface';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    async findAll({
        userId,
        accountId,
        transactionCategoryId,
        type,
        ...paginationQuery
    }: FindAllTransactionsDto): Promise<Transaction[]> {
        if (!userId && !accountId && !transactionCategoryId) {
            throw new BadRequestException(
                'At least one of `userId`, `accountId` or `transactionCategoryId` must be provided',
            );
        }

        const where: FindOptionsWhere<Transaction> = {
            type,
        };

        if (userId) {
            where.user = { id: userId };
        }

        if (accountId) {
            where.fromAccount = { id: accountId };
            where.toAccount = { id: accountId };
        }

        if (transactionCategoryId) {
            where.fromCategory = { id: transactionCategoryId };
            where.toCategory = { id: transactionCategoryId };
        }

        return this.transactionRepository.find({
            take: paginationQuery.limit,
            skip: calculateSkipOption(paginationQuery),
            where,
            order: { type: 'ASC', createdAt: 'DESC' },
            relations: {
                user: true,
                fromAccount: true,
                toAccount: true,
                fromCategory: true,
                toCategory: true,
            },
        });
    }

    async findOne(
        id: Transaction['id'],
        relations?: FindOptionsRelations<Transaction>,
    ): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations,
        });

        if (!transaction) {
            throw new NotFoundException('Transaction', id);
        }

        return transaction;
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        this.validateTransactionProperties(createTransactionDto);
        this.validateCreateTransactionProperties(createTransactionDto);

        throw new BadRequestException('Creating Transaction is not supported');
    }

    async edit(
        id: Transaction['id'],
        editTransactionDto: EditTransactionDto,
    ): Promise<Transaction> {
        this.validateTransactionProperties(editTransactionDto);

        throw new BadRequestException('Editing Transaction is not supported');
    }

    async delete(id: Transaction['id']): Promise<Transaction> {
        const transaction = await this.findOne(id);

        return this.transactionRepository.remove(transaction);
    }

    private validateTransactionProperties({
        fromAccountId,
        toAccountId,
        fromCategoryId,
        toCategoryId,
    }: IValidateTransactionPropertiesArgs): void {
        if (fromAccountId && fromCategoryId) {
            throw new BadRequestException(
                'Transaction cannot have both `fromAccountId` and `fromCategoryId`',
            );
        }

        if (toAccountId && toCategoryId) {
            throw new BadRequestException(
                'Transaction cannot have both `toAccountId` and `toCategoryId`',
            );
        }
    }

    private validateCreateTransactionProperties({
        fromAccountId,
        toAccountId,
        fromCategoryId,
        toCategoryId,
    }: CreateTransactionDto): void {
        if (!fromAccountId && !fromCategoryId) {
            throw new BadRequestException(
                'Transaction must have either `fromAccountId` or `fromCategoryId`',
            );
        }

        if (!toAccountId && !toCategoryId) {
            throw new BadRequestException(
                'Transaction must have either `toAccountId` or `toCategoryId`',
            );
        }
    }

    // TODO: Implement method to calculate transaction category balanceZ
    // TODO: Implement method to calculate account balance
}
