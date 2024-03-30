import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { Transaction } from '../shared/entities/transaction.entity';

import { TransactionsService } from './transactions.service';
import { FindAllTransactionsDto } from './dtos/find-all-transactions.dto';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { EditTransactionDto } from './dtos/edit-transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @ApiOkResponse({ type: [Transaction] })
    @Get()
    findAll(@Query() query: FindAllTransactionsDto): Promise<Transaction[]> {
        return this.transactionsService.findAll(query);
    }

    @ApiOkResponse({ type: Transaction })
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Transaction> {
        return this.transactionsService.findOne(id);
    }

    @ApiOkResponse({ type: Transaction })
    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        return this.transactionsService.create(createTransactionDto);
    }

    @ApiOkResponse({ type: Transaction })
    @Patch(':id')
    editOne(
        @Param('id') id: number,
        @Body() editTransactionDto: EditTransactionDto,
    ): Promise<Transaction> {
        return this.transactionsService.edit(id, editTransactionDto);
    }

    @ApiOkResponse({ type: Transaction })
    @Delete(':id')
    delete(@Param('id') id: number): Promise<Transaction> {
        return this.transactionsService.delete(id);
    }
}
