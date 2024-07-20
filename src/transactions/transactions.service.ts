import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
import { validateTransactionProperties } from './utils/validateTransactionProperties.util';
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

        let transaction: Transaction | null = null;

        switch (createTransactionDto.type) {
            case ETransactionType.TRANSFER:
                transaction = await createTransferTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                });
                break;
            case ETransactionType.EXPENSE:
                transaction = await createExpenseTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
                break;
            case ETransactionType.INCOME:
                transaction = await createIncomeTransaction({
                    createTransactionDto,
                    queryRunner: this.dataSource.createQueryRunner(),
                    findUserById: this.usersService.findOne,
                    findAccountById: this.accountRepository.findOne,
                    findTransactionCategoryById: this.transactionCategoryRepository.findOne,
                });
                break;
            default:
                throw new BadRequestException('Unsupported Transaction type');
        }

        if (!transaction) {
            throw new InternalServerErrorException('Transaction creation failed');
        }

        return transaction;
    }

    async edit(
        id: Transaction['id'],
        editTransactionDto: EditTransactionDto,
    ): Promise<Transaction> {
        // TODO: edit only if transaction is recent

        validateTransactionProperties(editTransactionDto);

        throw new BadRequestException('Editing Transaction is not supported');
    }

    async delete(id: Transaction['id']): Promise<Transaction> {
        const transaction = await this.findOne(id);

        // TODO: Update balance of accounts (IG)

        return this.transactionRepository.remove(transaction);
    }

    // TODO: Implement method to calculate transaction category balance
    // TODO: Implement method to calculate account balance
}
