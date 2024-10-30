import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Query,
    Param,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from '../shared/pipes/custom-parse-int.pipe';
import { Account } from '../shared/entities/account.entity';
import { EUserRole } from '../shared/enums/user-role.enums';

import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { EAuthType } from '../iam/authentication/enums/auth-type.enum';
import { OnlyMe } from '../iam/authorization/decorators/only-me.decorator';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { IActiveUser } from '../iam/interfaces/active-user-data.interface';
import { UserRole } from '../iam/authorization/decorators/user-role.decorator';

import { AccountsService } from './accounts.service';
import { FindMyAccountsDto } from './dtos/find-my-accounts.dto';
import { FindAllAccountsDto } from './dtos/find-all-accounts.dto';
import { CreateAccountDto } from './dtos/create-account.dto';
import { EditAccountDto } from './dtos/edit-account.dto';
import { EditAccountCurrencyDto } from './dtos/edit-account-currency.dto';
import { ReorderAccountDto } from './dtos/reorder-account.dto';

@ApiTags('accounts')
@Auth(EAuthType.Bearer, EAuthType.ApiKey)
@OnlyMe()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @ApiOkResponse({ type: [Account] })
    @Get('my')
    findMy(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Query() dto: FindMyAccountsDto,
    ): Promise<Account[]> {
        return this.accountsService.findAll({ userId: activeUserId, ...dto });
    }

    @ApiOkResponse({ type: [Account] })
    @Get()
    @UserRole(EUserRole.ADMIN)
    findAll(@Query() query: FindAllAccountsDto): Promise<Account[]> {
        return this.accountsService.findAll(query);
    }

    @ApiOkResponse({ type: Account })
    @Get(':id')
    getOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
    ): Promise<Account> {
        return this.accountsService.getOne({ id, activeUserId });
    }

    @ApiOkResponse({ type: Account })
    @Post()
    create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
        return this.accountsService.create(createAccountDto);
    }

    @ApiOkResponse({ type: Account })
    @Patch(':id')
    editOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editAccountDto: EditAccountDto,
    ): Promise<Account> {
        return this.accountsService.edit({ id, activeUserId, editAccountDto });
    }

    @ApiOkResponse({ type: Account })
    @Patch('currency/:id')
    editOnesCurrency(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editAccountCurrencyDto: EditAccountCurrencyDto,
    ): Promise<Account> {
        return this.accountsService.editCurrency({ id, activeUserId, editAccountCurrencyDto });
    }

    @ApiOkResponse({ type: [Account] })
    @Patch('reorder/:id')
    reorderOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() reorderAccountDto: ReorderAccountDto,
    ): Promise<Account[]> {
        return this.accountsService.reorder({ id, activeUserId, reorderAccountDto });
    }

    @ApiOkResponse({ type: Account })
    @Delete(':id')
    delete(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
    ): Promise<Account[]> {
        return this.accountsService.delete({ id, activeUserId });
    }
}
