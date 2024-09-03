import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsRelations } from 'typeorm';
import { calculateSkipOption } from '../shared/utils/pagination.utils';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { Transaction } from '../shared/entities/transaction.entity';
import { Account } from '../shared/entities/account.entity';
import { TransactionCategory } from '../shared/entities/transaction-category.entity';
import { PaginatedItemsResultDto } from '../shared/dtos/paginated-items-result.dto';
import { ETransactionType } from '../shared/enums/transaction.enums';
import { UsersService } from '../users/users.service';

import { FindAllTransactionsDto } from './dtos/find-all-transactions.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { EditTransactionDto } from './dtos/edit-transaction.dto';
import { validateFindAllTransactionProperties } from './utils/validateFindAllTransactionProperties.util';
import { getFindAllWhereInput } from './utils/getFindAllWhereInput.util';
import { validateCreateTransactionProperties } from './utils/validateCreateTransactionProperties.util';
import { createTransferTransaction } from './utils/createTransferTransaction.util';
import { createExpenseTransaction } from './utils/createExpenseTransaction.util';
import { createIncomeTransaction } from './utils/createIncomeTransaction.util';

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
            take: query.limit,
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
        };
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
        validateCreateTransactionProperties(createTransactionDto);

        switch (createTransactionDto.type) {
            case ETransactionType.TRANSFER:
                return createTransferTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                });
            case ETransactionType.EXPENSE:
                return createExpenseTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
            case ETransactionType.INCOME:
                return createIncomeTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
            default:
                throw new BadRequestException('Unsupported Transaction type');
        }
    }

    async edit(id: Transaction['id'], { description }: EditTransactionDto): Promise<Transaction> {
        const transaction = await this.transactionRepository.preload({
            id,
            description,
        });

        if (!transaction) {
            throw new NotFoundException('Transaction', id);
        }

        return this.transactionRepository.save(transaction);
    }

    async delete(id: Transaction['id']): Promise<Transaction> {
        const transaction = await this.findOne(id);
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
