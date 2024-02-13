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

import { Account } from './account.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './accounts.dto';
import { EditAccountDto } from './accounts.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Query('userId') userId: number): Promise<Account[]> {
    return this.accountsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Account> {
    return this.accountsService.findOne(id);
  }

  @Post()
  create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Patch(':id')
  editOne(
    @Param('id') id: number,
    @Body() editAccountDto: EditAccountDto,
  ): Promise<Account> {
    return this.accountsService.edit(id, editAccountDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<Account> {
    return this.accountsService.delete(id);
  }
}
