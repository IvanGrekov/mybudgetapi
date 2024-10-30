import {
    Controller,
    Get,
    Query,
    Param,
    Body,
    Patch,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CustomParseIntPipe } from '../shared/pipes/custom-parse-int.pipe';
import { User } from '../shared/entities/user.entity';
import { PaginationQueryDto } from '../shared/dtos/pagination.dto';
import { PaginatedItemsResultDto } from '../shared/dtos/paginated-items-result.dto';
import { EUserRole } from '../shared/enums/user-role.enums';

import { EAuthType } from '../iam/authentication/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { IActiveUser } from '../iam/interfaces/active-user-data.interface';
import { UserRole } from '../iam/authorization/decorators/user-role.decorator';
import { OnlyMe } from '../iam/authorization/decorators/only-me.decorator';

import { UsersService } from './users.service';
import { EditUserDto } from './dtos/edit-user.dto';
import { EditUserCurrencyDto } from './dtos/edit-user-currency.dto';
import { EditUserRoleDto } from './dtos/edit-user-role.dto';

@ApiTags('users')
@Auth(EAuthType.Bearer, EAuthType.ApiKey)
@UseInterceptors(ClassSerializerInterceptor)
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
    getMe(@ActiveUser('sub') activeUserId: IActiveUser['sub']): Promise<User> {
        return this.usersService.getMe(activeUserId);
    }

    @ApiOkResponse({ type: [User] })
    @Get()
    @UserRole(EUserRole.ADMIN)
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
    @OnlyMe({
        paramsKey: 'id',
    })
    getOne(@Param('id', CustomParseIntPipe) id: number): Promise<User> {
        return this.usersService.getOne(id);
    }

    @ApiOkResponse({ type: User })
    @Patch(':id')
    @OnlyMe({
        paramsKey: 'id',
    })
    editOne(
        @Param('id', CustomParseIntPipe) id: number,
        @Body() editUserDto: EditUserDto,
    ): Promise<User> {
        return this.usersService.edit(id, editUserDto);
    }

    @ApiOkResponse({ type: User })
    @Patch('currency/:id')
    @OnlyMe({
        paramsKey: 'id',
    })
    editCurrency(
        @Param('id') id: number,
        @Body() editUserCurrencyDto: EditUserCurrencyDto,
    ): Promise<User> {
        return this.usersService.editCurrency(id, editUserCurrencyDto);
    }

    @ApiOkResponse({ type: User })
    @Patch('role/:id')
    @UserRole(EUserRole.ADMIN)
    editRole(@Param('id') id: number, @Body() editUserRoleDto: EditUserRoleDto): Promise<User> {
        return this.usersService.editRole(id, editUserRoleDto);
    }

    @ApiOkResponse({ type: User })
    @Delete(':id')
    @OnlyMe({
        paramsKey: 'id',
    })
    deleteOne(@Param('id', CustomParseIntPipe) id: number): Promise<User> {
        return this.usersService.delete(id);
    }
}
