import { Controller, Get, Query, Post, Param, Body, Patch, Delete } from '@nestjs/common';

import { User } from '../shared/entities/user.entity';
import { PaginationQueryDto } from '../shared/dtos/pagination.dto';

import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/edit-user.dto';
import { EditUserCurrencyDto } from './dtos/create-user-currency.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<User[]> {
        return this.usersService.findAll(paginationQuery);
    }

    @Get('name')
    getNewName(): Promise<string> {
        return this.usersService.getNewName();
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<User> {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id')
    editOne(@Param('id') id: number, @Body() editUserDto: EditUserDto): Promise<User> {
        return this.usersService.edit(id, editUserDto);
    }

    @Patch('currency/:id')
    editOnesCurrency(
        @Param('id') id: number,
        @Body() editUserCurrencyDto: EditUserCurrencyDto,
    ): Promise<User> {
        return this.usersService.editCurrency(id, editUserCurrencyDto);
    }

    @Delete(':id')
    deleteOne(@Param('id') id: number): Promise<User> {
        return this.usersService.delete(id);
    }
}
