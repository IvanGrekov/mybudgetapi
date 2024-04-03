import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { calculateSkipOption } from '../shared/utils/pagination.utils';

import NotFoundException from '../shared/exceptions/not-found.exception';
import { Transaction } from '../shared/entities/transaction.entity';

import { FindAllTransactionsDto } from './dtos/find-all-transactions.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { EditTransactionDto } from './dtos/edit-transaction.dto';
import { validateTransactionProperties } from './utils/validateTransactionProperties.util';
import { validateFindAllTransactionProperties } from './utils/validateFindAllTransactionProperties.util';
import { getFindAllWhereInput } from './utils/getFindAllWhereInput.util';
import { validateCreateTransactionProperties } from './utils/validateCreateTransactionProperties.util';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) {}

    async findAll(query: FindAllTransactionsDto): Promise<Transaction[]> {
        validateFindAllTransactionProperties(query);

        return this.transactionRepository.find({
            take: query.limit,
            skip: calculateSkipOption(query),
            where: getFindAllWhereInput(query),
            order: { createdAt: 'DESC' },
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
        validateCreateTransactionProperties(createTransactionDto);

        throw new BadRequestException('Creating Transaction is not supported');
    }

    async edit(
        id: Transaction['id'],
        editTransactionDto: EditTransactionDto,
    ): Promise<Transaction> {
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
