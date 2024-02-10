import {
  Controller,
  Get,
  Query,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';

import { PaginationQueryDto } from '../shared/dto/pagination-query.dto';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { EditUserCurrencyDto } from './dto/edit-user-currency.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto): Promise<User[]> {
    return this.usersService.findAll(paginationQuery);
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
  editOne(
    @Param('id') id: number,
    @Body() editUserDto: EditUserDto,
  ): Promise<User> {
    return this.usersService.edit(id, editUserDto);
  }

  @Patch('currency/:id')
  editOnesCurrency(
    @Param('id') id: number,
    @Body() editUserCurrencyDto: EditUserCurrencyDto,
  ): Promise<User> {
    return this.usersService.editUserCurrency(id, editUserCurrencyDto);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Promise<User> {
    return this.usersService.delete(id);
  }
}
