import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  Param,
} from '@nestjs/common';

import { Account } from './entities/account.entity';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { EditAccountDto } from './dto/edit-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Query() query): Promise<Account[]> {
    const { limit, page, userId } = query || {};

    return this.accountsService.findAll({
      limit,
      page,
      userId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Account> {
    return this.accountsService.findOne(+id);
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
  deleteOne(@Param('id') id: number): Promise<Account> {
    return this.accountsService.delete(id);
  }
}
