import { Controller, Get, Query, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from '../shared/pipes/custom-parse-int.pipe';
import { User } from '../shared/entities/user.entity';
import { Public } from '../shared/decorators/public.decorator';
import { PaginationQueryDto } from '../shared/dtos/pagination.dto';
import { PaginatedItemsResultDto } from '../shared/dtos/paginated-items-result.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/edit-user.dto';
import { EditUserCurrencyDto } from './dtos/create-user-currency.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({ type: String })
    @Get('name')
    @Public()
    getNewName(): Promise<string> {
        return this.usersService.getNewName();
    }

    @ApiOkResponse({ type: [User] })
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<PaginatedItemsResultDto<User>> {
        return this.usersService.findAll(paginationQuery);
    }

    @ApiOkResponse({
        type: User,
        example: {
            id: 1,
            nickname: 'Johndoe',
            defaultCurrency: 'USD',
            language: 'EN',
            timeZone: 'UTC',
            createdAt: '2021-06-17T09:00:00.000Z',
        },
    })
    @Get(':id')
    findOne(@Param('id', CustomParseIntPipe) id: number): Promise<User> {
        return this.usersService.findOne(id);
    }

    @ApiOkResponse({ type: User })
    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @ApiOkResponse({ type: User })
    @Patch(':id')
    editOne(
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editUserDto: EditUserDto,
    ): Promise<User> {
        return this.usersService.edit(id, editUserDto);
    }

    @ApiOkResponse({ type: User })
    @Patch('currency/:id')
    editOnesCurrency(
        @Param('id') id: number,
        @Body() editUserCurrencyDto: EditUserCurrencyDto,
    ): Promise<User> {
        return this.usersService.editCurrency(id, editUserCurrencyDto);
    }

    @ApiOkResponse({ type: User })
    @Delete(':id')
    deleteOne(@Param('id', CustomParseIntPipe) id: number): Promise<User> {
        return this.usersService.delete(id);
    }
}
