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

import { CustomParseIntPipe } from 'shared/pipes/custom-parse-int.pipe';
import { TransactionCategory } from 'shared/entities/transaction-category.entity';
import { EUserRole } from 'shared/enums/user-role.enums';

import { Auth } from 'iam/authentication/decorators/auth.decorator';
import { EAuthType } from 'iam/authentication/enums/auth-type.enum';
import { OnlyMe } from 'iam/authorization/decorators/only-me.decorator';
import { ActiveUser } from 'iam/decorators/active-user.decorator';
import { IActiveUser } from 'iam/interfaces/active-user-data.interface';
import { UserRole } from 'iam/authorization/decorators/user-role.decorator';

import { TransactionCategoriesService } from 'transaction-categories/transaction-categories.service';
import { FindMyTransactionCategoriesDto } from 'transaction-categories/dtos/find-my-transaction-categories.dto';
import { FindAllTransactionCategoriesDto } from 'transaction-categories/dtos/find-all-transaction-categories.dto';
import { CreateTransactionCategoryDto } from 'transaction-categories/dtos/create-transaction-category.dto';
import { ReorderTransactionCategoriesDto } from 'transaction-categories/dtos/reorder-transaction-categories.dto';
import { EditTransactionCategoryDto } from 'transaction-categories/dtos/edit-transaction-category.dto';
import { EditTransactionCategoryCurrencyDto } from 'transaction-categories/dtos/edit-transaction-category-currency.dto';
import { DeleteTransactionCategoryDto } from 'transaction-categories/dtos/delete-transaction-category.dto';

@ApiTags('transaction-categories')
@Auth(EAuthType.Bearer, EAuthType.ApiKey)
@OnlyMe()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('transaction-categories')
export class TransactionCategoriesController {
    constructor(private readonly transactionCategoriesService: TransactionCategoriesService) {}

    @ApiOkResponse({ type: [TransactionCategory] })
    @Get('my')
    findMy(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Query() dto: FindMyTransactionCategoriesDto,
    ): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.findAll({
            userId: activeUserId,
            ...dto,
        });
    }

    @ApiOkResponse({ type: [TransactionCategory] })
    @Get()
    @UserRole(EUserRole.ADMIN)
    findAll(@Query() query: FindAllTransactionCategoriesDto): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.findAll(query);
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Get(':id')
    getOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.getOne({
            id,
            activeUserId,
        });
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Post()
    create(
        @Body() createTransactionCategoryDto: CreateTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.create(createTransactionCategoryDto);
    }

    @ApiOkResponse({ type: [TransactionCategory] })
    @Patch('reorder')
    reorder(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Body() reorderTransactionCategoriesDto: ReorderTransactionCategoriesDto,
    ): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.reorder({
            activeUserId,
            reorderTransactionCategoriesDto,
        });
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Patch(':id')
    editOne(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editTransactionCategoryDto: EditTransactionCategoryDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.edit({
            id,
            activeUserId,
            editTransactionCategoryDto,
        });
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Patch('currency/:id')
    editOnesCurrency(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editTransactionCategoryCurrencyDto: EditTransactionCategoryCurrencyDto,
    ): Promise<TransactionCategory> {
        return this.transactionCategoriesService.editCurrency({
            id,
            activeUserId,
            editTransactionCategoryCurrencyDto,
        });
    }

    @ApiOkResponse({ type: TransactionCategory })
    @Delete(':id')
    delete(
        @ActiveUser('sub') activeUserId: IActiveUser['sub'],
        @Param('id', CustomParseIntPipe) id: number,
        @Query() deleteTransactionCategoryDto: DeleteTransactionCategoryDto,
    ): Promise<TransactionCategory[]> {
        return this.transactionCategoriesService.delete({
            id,
            activeUserId,
            deleteTransactionCategoryDto,
        });
    }
}
