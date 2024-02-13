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

import { TransactionCategory } from '../entities/transaction-category.entity';
import { TransactionCategoriesService } from './transaction-categories.service';
import { CreateTransactionCategoryDto } from '../dto/create-transaction-category.dto';
import { EditTransactionCategoryDto } from '../dto/edit-transaction-category.dto';

@Controller('transaction-categories')
export class TransactionCategoriesController {
  constructor(
    private readonly transactionCategoriesService: TransactionCategoriesService,
  ) {}

  @Get()
  findAll(@Query('userId') userId: number): Promise<TransactionCategory[]> {
    return this.transactionCategoriesService.findAll(userId);
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

  @Delete(':id')
  delete(@Param('id') id: number): Promise<TransactionCategory> {
    return this.transactionCategoriesService.delete(id);
  }
}
