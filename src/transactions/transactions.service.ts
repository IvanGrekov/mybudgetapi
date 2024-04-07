import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { calculateSkipOption } from '../shared/utils/pagination.utils';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { Transaction } from '../shared/entities/transaction.entity';
import { Account } from '../shared/entities/account.entity';
import { ETransactionType } from '../shared/enums/transaction.enums';

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
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    async findAll(query: FindAllTransactionsDto): Promise<Transaction[]> {
        validateFindAllTransactionProperties(query);

        return this.transactionRepository.find({
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

        let transactionTemplate = null;

        switch (createTransactionDto.type) {
            case ETransactionType.TRANSFER:
                transactionTemplate = createTransferTransaction({
                    createTransactionDto,
                    findAccountById: this.accountRepository.findOne,
                    saveAccount: this.accountRepository.save,
                });
                break;
            case ETransactionType.EXPENSE:
                transactionTemplate = createExpenseTransaction(createTransactionDto);
                break;
            case ETransactionType.INCOME:
                transactionTemplate = createIncomeTransaction(createTransactionDto);
                break;
            default:
                throw new BadRequestException('Unsupported Transaction type');
        }

        const transaction = await this.transactionRepository.save(transactionTemplate);

        return this.findOne(transaction.id);
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

        return this.transactionRepository.remove(transaction);
    }

    // TODO: Implement method to calculate transaction category balanceZ
    // TODO: Implement method to calculate account balance
}
