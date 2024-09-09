import { Controller, Get, Post, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from '../shared/pipes/custom-parse-int.pipe';
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
    getOne(@Param('id', CustomParseIntPipe) id: number): Promise<Account> {
        return this.accountsService.getOne(id);
    }

    @ApiOkResponse({ type: Account })
    @Post()
    create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
        return this.accountsService.create(createAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Patch(':id')
    editOne(
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editAccountDto: EditAccountDto,
    ): Promise<Account> {
        return this.accountsService.edit(id, editAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Patch('currency/:id')
    editOnesCurrency(
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editAccountCurrencyDto: EditAccountCurrencyDto,
    ): Promise<Account> {
        return this.accountsService.editCurrency(id, editAccountCurrencyDto);
    }

    @ApiOkResponse({ type: [Account] })
    @Patch('reorder/:id')
    reorderOne(
        @Param('id', CustomParseIntPipe) id: number,
        @Body() reorderAccountDto: ReorderAccountDto,
    ): Promise<Account[]> {
        return this.accountsService.reorder(id, reorderAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Delete(':id')
    delete(@Param('id', CustomParseIntPipe) id: number): Promise<Account[]> {
        return this.accountsService.delete(id);
    }
}
