import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { Account } from '../shared/entities/account.entity';

import { AccountsService } from './accounts.service';
import { FindAllAccountsDto } from './dtos/find-all-accounts.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { EditAccountDto } from './dtos/edit-account.dto';
import { EditAccountCurrencyDto } from './dtos/edit-account-currency.dto';
import { ReorderAccountDto } from './dtos/reorder-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @ApiOkResponse({ type: [Account] })
    @Get()
    findAll(@Query() query: FindAllAccountsDto): Promise<Account[]> {
        return this.accountsService.findAll(query);
    }

    @ApiOkResponse({ type: Account })
    @Get(':id')
    findOne(@Param('id') id: number): Promise<Account> {
        return this.accountsService.findOne(id);
    }

    @ApiOkResponse({ type: Account })
    @Post()
    create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
        return this.accountsService.create(createAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Patch(':id')
    editOne(@Param('id') id: number, @Body() editAccountDto: EditAccountDto): Promise<Account> {
        return this.accountsService.edit(id, editAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Patch('currency/:id')
    editOnesCurrency(
        @Param('id') id: number,
        @Body() editAccountCurrencyDto: EditAccountCurrencyDto,
    ): Promise<Account> {
        return this.accountsService.editCurrency(id, editAccountCurrencyDto);
    }

    @ApiOkResponse({ type: [Account] })
    @Patch('reorder/:id')
    reorderOne(
        @Param('id') id: number,
        @Body() reorderAccountDto: ReorderAccountDto,
    ): Promise<Account[]> {
        return this.accountsService.reorder(id, reorderAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Delete(':id')
    delete(@Param('id') id: number): Promise<Account[]> {
        return this.accountsService.delete(id);
    }
}
