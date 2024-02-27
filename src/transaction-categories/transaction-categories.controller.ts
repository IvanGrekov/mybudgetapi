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
import {
  FindAllTransactionCategoriesDto,
  CreateTransactionCategoryDto,
  EditTransactionCategoryDto,
  EditTransactionCategoryCurrencyDto,
} from './transaction-categories.dto';

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
  ) {
    return this.transactionCategoriesService.editCurrency(
      id,
      editTransactionCategoryDto,
    );
  }

  @Patch('reorder/:id')
  reorderOne() {
    return this.transactionCategoriesService.reorder();
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<TransactionCategory> {
    return this.transactionCategoriesService.delete(id);
  }
}
