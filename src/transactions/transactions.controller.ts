import {
    Controller,
    Get,
    Post,
    Patch,
    Query,
    Param,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from 'shared/pipes/custom-parse-int.pipe';
import { Transaction } from 'shared/entities/transaction.entity';
import { PaginatedItemsResultDto } from 'shared/dtos/paginated-items-result.dto';
import { EUserRole } from 'shared/enums/user-role.enums';

import { Auth } from 'iam/authentication/decorators/auth.decorator';
import { EAuthType } from 'iam/authentication/enums/auth-type.enum';
import { OnlyMe } from 'iam/authorization/decorators/only-me.decorator';
import { ActiveUser } from 'iam/decorators/active-user.decorator';
import { IActiveUser } from 'iam/interfaces/active-user-data.interface';
import { UserRole } from 'iam/authorization/decorators/user-role.decorator';

import { TransactionsService } from 'transactions/transactions.service';
import { FindAllTransactionsDto } from 'transactions/dtos/find-all-transactions.dto';
import { FindMyTransactionsDto } from 'transactions/dtos/find-my-transactions.dto';
import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';
import { EditTransactionDto } from 'transactions/dtos/edit-transaction.dto';
import { CalculatedTransactionValuesDto } from 'transactions/dtos/calculated-transaction-values.dto';
import { GetCalculatedTransactionValuesDto } from 'transactions/dtos/get-calculated-transaction-values.dto';

@ApiTags('transactions')
@Auth(EAuthType.Bearer, EAuthType.ApiKey)
@OnlyMe()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @ApiOkResponse({ type: [Transaction] })
    @Get('my')
    findMy(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Query() dto: FindMyTransactionsDto,
    ): Promise<PaginatedItemsResultDto<Transaction>> {
        return this.transactionsService.findAll({ userId: activeUserId, ...dto });
    }

    @ApiOkResponse({ type: [Transaction] })
    @Get()
    @UserRole(EUserRole.ADMIN)
    findAll(@Query() dto: FindAllTransactionsDto): Promise<PaginatedItemsResultDto<Transaction>> {
        return this.transactionsService.findAll(dto);
    }

    @ApiOkResponse({ type: CalculatedTransactionValuesDto })
    @Get('calculated-transaction-values')
    getCalculatedTransactionValues(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Query() dto: GetCalculatedTransactionValuesDto,
    ): Promise<CalculatedTransactionValuesDto> {
        return this.transactionsService.getCalculatedTransactionValues(dto, activeUserId);
    }

    @ApiOkResponse({ type: Transaction })
    @Get(':id')
    getOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
    ): Promise<Transaction> {
        return this.transactionsService.getOne({ id, activeUserId });
    }

    @ApiOkResponse({ type: Transaction })
    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        return this.transactionsService.create(createTransactionDto);
    }

    @ApiOkResponse({ type: Transaction })
    @Patch(':id')
    editOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editTransactionDto: EditTransactionDto,
    ): Promise<Transaction> {
        return this.transactionsService.edit({ id, activeUserId, editTransactionDto });
    }
}
