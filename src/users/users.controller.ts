import { Controller, Get, Post, Param, Body } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'many users';
  }

  @Get(':id')
  findOne(@Param('id') id: string): string {
    return `single user:${id}`;
  }

  @Post()
  create(@Body() body): string {
    return `create user - ${JSON.stringify(body)}`;
  }
}
