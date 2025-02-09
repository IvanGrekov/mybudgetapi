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
import { validateUserOwnership } from 'shared/utils/validateUserOwnership';

import { UsersService } from 'users/users.service';

import { FindAllTransactionsDto } from 'transactions/dtos/find-all-transactions.dto';
import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';
import { GetCalculatedTransactionValuesDto } from 'transactions/dtos/get-calculated-transaction-values.dto';
import { CalculatedTransactionValuesDto } from 'transactions/dtos/calculated-transaction-values.dto';
import { validateFindAllTransactionProperties } from 'transactions/utils/validateFindAllTransactionProperties.util';
import { getFindAllWhereInput } from 'transactions/utils/getFindAllWhereInput.util';
import { validateCreateTransactionProperties } from 'transactions/utils/validateCreateTransactionProperties.util';
import { createTransferTransaction } from 'transactions/utils/createTransferTransaction.util';
import { createExpenseTransaction } from 'transactions/utils/createExpenseTransaction.util';
import { createIncomeTransaction } from 'transactions/utils/createIncomeTransaction.util';
import { validateGetCalculatedTransactionValuesProperties } from 'transactions/utils/validateGetCalculatedTransactionValuesProperties.util';
import { calculateAccountTransactions } from 'transactions/utils/calculateAccountTransactions.util';
import { calculateTransactionCategoryTransactions } from 'transactions/utils/calculateTransactionCategoryTransactions.util';
import { IGetOneTransactionArgs } from 'transactions/interfaces/get-one-transaction-args.interface';
import { IEditTransactionArgs } from 'transactions/interfaces/edit-transaction-args.interface';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(TransactionCategory)
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

        const getUserById = (id: number) => this.usersService.getOne(id);

        switch (createTransactionDto.type) {
            case ETransactionType.TRANSFER:
                return createTransferTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById,
                    findAccountById: this.findAccountById.bind(this),
                });
            case ETransactionType.EXPENSE:
                return createExpenseTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById,
                    findAccountById: this.findAccountById.bind(this),
                    findTransactionCategoryById: this.findTransactionCategoryById.bind(this),
                });
            case ETransactionType.INCOME:
                return createIncomeTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    getUserById,
                    findAccountById: this.findAccountById.bind(this),
                    findTransactionCategoryById: this.findTransactionCategoryById.bind(this),
                });
            default:
                throw new BadRequestException('Unsupported Transaction type');
        }
    }

    private async findAccountById(id: number): Promise<Account> {
        return this.accountRepository.findOne({
            where: { id },
            relations: {
                user: true,
            },
        });
    }

    private async findTransactionCategoryById(id: number): Promise<TransactionCategory> {
        return this.transactionCategoryRepository.findOne({
            where: { id },
            relations: {
                user: true,
            },
        });
    }

    async getCalculatedTransactionValues(
        dto: GetCalculatedTransactionValuesDto,
        activeUserId: number,
    ): Promise<CalculatedTransactionValuesDto> {
        const { accountId, transactionCategoryId } = dto;

        validateGetCalculatedTransactionValuesProperties({ accountId, transactionCategoryId });

        let account: Account | null = null;
        let transactionCategory: TransactionCategory | null = null;

        if (accountId) {
            account = await this.accountRepository.findOne({
                where: { id: accountId },
                relations: {
                    user: true,
                },
            });

            if (!account) {
                throw new NotFoundException('Account', accountId);
            }

            validateUserOwnership({
                activeUserId,
                entity: account,
            });
        }

        if (transactionCategoryId) {
            transactionCategory = await this.transactionCategoryRepository.findOne({
                where: { id: transactionCategoryId },
                relations: {
                    user: true,
                },
            });

            if (!transactionCategory) {
                throw new NotFoundException('Transaction Category', transactionCategoryId);
            }

            validateUserOwnership({
                activeUserId,
                entity: transactionCategory,
            });
        }

        const transactions = await this.transactionRepository.find({
            where: getFindAllWhereInput({ ...dto, userId: activeUserId }),
            relations: {
                fromAccount: true,
                toAccount: true,
                fromCategory: true,
                toCategory: true,
            },
        });

        if (!transactions.length) {
            return {};
        }

        if (account) {
            return calculateAccountTransactions({
                transactions,
                account,
            });
        } else {
            return calculateTransactionCategoryTransactions({
                transactions,
                transactionCategory,
            });
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
}
