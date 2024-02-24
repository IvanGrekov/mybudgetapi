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

import { User } from '../shared/entities/user.entity';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';

import { UsersService } from './users.service';
import { CreateUserDto, EditUserDto, EditUserCurrencyDto } from './users.dto';

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
    return this.usersService.editCurrency(id, editUserCurrencyDto);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Promise<User> {
    return this.usersService.delete(id);
  }
}
