import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { calculateSkipOption } from 'shared/utils/pagination.utils';

import NotFoundException from 'shared/exceptions/not-found.exception';
import { Transaction } from 'shared/entities/transaction.entity';
import { Account } from 'shared/entities/account.entity';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { PaginatedItemsResultDto } from 'shared/dtos/paginated-items-result.dto';
import { ETransactionType } from 'shared/enums/transaction.enums';
import { UsersService } from 'users/users.service';
import { validateUserOwnership } from 'shared/utils/validateUserOwnership';

import { FindAllTransactionsDto } from 'transactions/dtos/find-all-transactions.dto';
import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';
import { validateFindAllTransactionProperties } from 'transactions/utils/validateFindAllTransactionProperties.util';
import { getFindAllWhereInput } from 'transactions/utils/getFindAllWhereInput.util';
import { validateCreateTransactionProperties } from 'transactions/utils/validateCreateTransactionProperties.util';
import { createTransferTransaction } from 'transactions/utils/createTransferTransaction.util';
import { createExpenseTransaction } from 'transactions/utils/createExpenseTransaction.util';
import { createIncomeTransaction } from 'transactions/utils/createIncomeTransaction.util';
import { IGetOneTransactionArgs } from 'transactions/interfaces/get-one-transaction-args.interface';
import { IEditTransactionArgs } from 'transactions/interfaces/edit-transaction-args.interface';
import { IDeleteTransactionArgs } from 'transactions/interfaces/delete-transaction-args.interface';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(Account)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(query: FindAllTransactionsDto): Promise<PaginatedItemsResultDto<Transaction>> {
        const { offset, limit } = query;

        validateFindAllTransactionProperties(query);

        const [items, total] = await this.transactionRepository.findAndCount({
            take: limit,
            skip: calculateSkipOption(query),
            where: getFindAllWhereInput(query),
            order: { createdAt: 'DESC' },
            relations: {
                fromAccount: true,
                toAccount: true,
                fromCategory: true,
                toCategory: true,
            },
        });

        return {
            items,
            page: offset,
            itemsPerPage: limit,
            total,
            hasMore: total > offset * limit,
        };
    }

    async getOne({ id, activeUserId, relations }: IGetOneTransactionArgs): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: {
                user: true,
                ...relations,
            },
        });

        validateUserOwnership({
            activeUserId,
            entity: transaction,
        });

        if (!transaction) {
            throw new NotFoundException('Transaction', id);
        }

        return transaction;
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        validateCreateTransactionProperties(createTransactionDto);

        switch (createTransactionDto.type) {
            case ETransactionType.TRANSFER:
                return createTransferTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById: this.usersService.getOne,
                    findAccountById: this.accountRepository.findOne,
                });
            case ETransactionType.EXPENSE:
                return createExpenseTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById: this.usersService.getOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
            case ETransactionType.INCOME:
                return createIncomeTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById: this.usersService.getOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
            default:
                throw new BadRequestException('Unsupported Transaction type');
        }
    }

    async edit({
        id,
        activeUserId,
        editTransactionDto: { description },
    }: IEditTransactionArgs): Promise<Transaction> {
        await this.getOne({ id, activeUserId });

        const transactionTemplate = await this.transactionRepository.preload({
            id,
            description,
        });

        return this.transactionRepository.save(transactionTemplate);
    }

    async delete({ id, activeUserId }: IDeleteTransactionArgs): Promise<Transaction> {
        const transaction = await this.getOne({
            id,
            activeUserId,
        });
        const { value, fee, fromAccount, toAccount } = transaction;

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (fromAccount) {
                const newFromAccountBalance = fromAccount.balance + value + fee;
                queryRunner.manager.update(Account, fromAccount.id, {
                    balance: newFromAccountBalance,
                });
            }

            if (toAccount) {
                const newToAccountBalance = toAccount.balance - value;
                queryRunner.manager.update(Account, toAccount.id, {
                    balance: newToAccountBalance,
                });
            }

            queryRunner.manager.remove(transaction);

            await queryRunner.commitTransaction();

            return transaction;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
