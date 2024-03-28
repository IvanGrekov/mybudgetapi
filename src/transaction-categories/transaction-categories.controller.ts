import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
} from '@nestjs/common';

import { TransactionCategory } from '../shared/entities/transaction-category.entity';

import { TransactionCategoriesService } from './transaction-categories.service';
import { FindAllTransactionCategoriesDto } from './dtos/find-all-transaction-categories.dto';
import { CreateTransactionCategoryDto } from './dtos/create-transaction-category.dto';
import { ReorderTransactionCategoriesDto } from './dtos/reorder-transaction-categories.dto';
import { EditTransactionCategoryDto } from './dtos/edit-transaction-category.dto';
import { EditTransactionCategoryCurrencyDto } from './dtos/edit-transaction-category-currency.dto';

@Controller('transaction-categories')
export class TransactionCategoriesController {
  constructor(
    private readonly transactionCategoriesService: TransactionCategoriesService,
  ) {}

  @Get()
  findAll(
    @Query() query: FindAllTransactionCategoriesDto,
  ): Promise<TransactionCategory[]> {
    return this.transactionCategoriesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<TransactionCategory> {
    return this.transactionCategoriesService.findOne(id);
  }

  @Post()
  create(
    @Body() createTransactionCategoryDto: CreateTransactionCategoryDto,
  ): Promise<TransactionCategory> {
    return this.transactionCategoriesService.create(
      createTransactionCategoryDto,
    );
  }

  @Patch('reorder')
  reorderOne(
    @Body() reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto,
  ): Promise<TransactionCategory[]> {
    return this.transactionCategoriesService.reorder(
      reorderTransactionCategoriesDto,
    );
  }

  @Patch(':id')
  editOne(
    @Param('id') id: number,
    @Body() editTransactionCategoryDto: EditTransactionCategoryDto,
  ): Promise<TransactionCategory> {
    return this.transactionCategoriesService.edit(
      id,
      editTransactionCategoryDto,
    );
  }

  @Patch('currency/:id')
  editOnesCurrency(
    @Param('id') id: number,
    @Body() editTransactionCategoryDto: EditTransactionCategoryCurrencyDto,
  ): Promise<TransactionCategory> {
    return this.transactionCategoriesService.editCurrency(
      id,
      editTransactionCategoryDto,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<TransactionCategory> {
    return this.transactionCategoriesService.delete(id);
  }
}
