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
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query): User[] {
    const { limit, page } = query;

    return this.usersService.findAll(limit, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string): User {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() body): User {
    return this.usersService.create(body);
  }

  @Patch(':id')
  editOne(@Param('id') id: string, @Body() body): User {
    return this.usersService.edit(id, body);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): User {
    return this.usersService.delete(id);
  }
}
