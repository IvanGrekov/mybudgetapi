import { Controller, Get, Query, Param, Body, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from '../shared/pipes/custom-parse-int.pipe';
import { User } from '../shared/entities/user.entity';
import { AuthToken } from '../shared/decorators/authToken.decorator';
import { PaginationQueryDto } from '../shared/dtos/pagination.dto';
import { PaginatedItemsResultDto } from '../shared/dtos/paginated-items-result.dto';

import { EAuthType } from '../iam/authentication/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';

import { UsersService } from './users.service';
import { EditUserDto } from './dtos/edit-user.dto';
import { EditUserCurrencyDto } from './dtos/create-user-currency.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOkResponse({ type: String })
    @Get('name')
    @Auth(EAuthType.None)
    getNewName(): Promise<string> {
        return this.usersService.getNewName();
    }

    @ApiOkResponse({ type: User })
    @Get('me')
    getMe(@AuthToken() token: string): Promise<User> {
        return this.usersService.getMe(token);
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
    getOne(@Param('id', CustomParseIntPipe) id: number): Promise<User> {
        return this.usersService.getOne(id);
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
