import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { TransactionCategory } from '../shared/entities/transaction-category.entity';

import { TransactionCategoriesService } from './transaction-categories.service';
import { FindAllTransactionCategoriesDto } from './dtos/find-all-transaction-categories.dto';
import { CreateTransactionCategoryDto } from './dtos/create-transaction-category.dto';
import { ReorderTransactionCategoriesDto } from './dtos/reorder-transaction-categories.dto';
import { EditTransactionCategoryDto } from './dtos/edit-transaction-category.dto';
import { EditTransactionCategoryCurrencyDto } from './dtos/edit-transaction-category-currency.dto';
import { DeleteTransactionCategoryDto } from './dtos/delete-transaction-category.dto';

@ApiTags('transaction-categories')
@Controller('transaction-categories')
export class TransactionCategoriesController {
    constructor(private readonly transactionCategoriesService: TransactionCategoriesService) {}

    @ApiOkResponse({ type: [TransactionCategory] })
    @Get()
    findAll(@Query() query: FindAllTransactionCategoriesDto): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.findAll(query);
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Get(':id')
    findOne(@Param('id') id: number): Promise<TransactionCategory> {
        return this.transactionCategoriesService.findOne(id);
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Post()
    create(
        @Body() createTransactionCategoryDto: CreateTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.create(createTransactionCategoryDto);
    }

    @ApiOkResponse({ type: [TransactionCategory] })
    @Patch('reorder')
    reorderOne(
        @Body() reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto,
    ): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.reorder(reorderTransactionCategoriesDto);
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Patch(':id')
    editOne(
        @Param('id') id: number,
        @Body() editTransactionCategoryDto: EditTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.edit(id, editTransactionCategoryDto);
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Patch('currency/:id')
    editOnesCurrency(
        @Param('id') id: number,
        @Body() editTransactionCategoryCurrencyDto: EditTransactionCategoryCurrencyDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.editCurrency(
            id,
            editTransactionCategoryCurrencyDto,
        );
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Delete(':id')
    delete(
        @Param('id') id: number,
        @Query() deleteTransactionCategoryDto: DeleteTransactionCategoryDto,
    ): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.delete(id, deleteTransactionCategoryDto);
    }
}
