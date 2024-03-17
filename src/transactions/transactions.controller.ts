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

import { Transaction } from '../shared/entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import {
  FindAllTransactionsDto,
  CreateTransactionDto,
  EditTransactionDto,
} from './transactions.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: FindAllTransactionsDto): Promise<Transaction[]> {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Transaction> {
    return this.transactionsService.findOne(id);
  }

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.create(createTransactionDto);
  }

  @Patch(':id')
  editOne(
    @Param('id') id: number,
    @Body() editTransactionDto: EditTransactionDto,
  ): Promise<Transaction> {
    return this.transactionsService.edit(id, editTransactionDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<Transaction> {
    return this.transactionsService.delete(id);
  }
}
