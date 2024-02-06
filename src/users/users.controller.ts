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

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query): Promise<User[]> {
    const { limit, page } = query || {};

    return this.usersService.findAll(limit, page);
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

  @Delete(':id')
  deleteOne(@Param('id') id: number): Promise<User> {
    return this.usersService.delete(id);
  }
}
