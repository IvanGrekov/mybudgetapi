import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { EUserRole } from 'shared/enums/user-role.enums';
import { ApiKey } from 'shared/entities/api-key.entity';

import { UserRole } from 'iam/authorization/decorators/user-role.decorator';
import { GeneratedApiKeyDto } from 'iam/authentication/dtos/generated-api-key-payload.dto';
import { ApiKeysService } from 'iam/authentication/services/api-keys.service';
import { CreateApiKeyForUserDto } from 'iam/authentication/dtos/create-api-key-for-user.dto';
import { GetApiKeyByUserIdDto } from 'iam/authentication/dtos/get-api-key-by-user-id.dto';

@ApiTags('api-keys')
@UserRole(EUserRole.ADMIN)
@Controller('api-keys')
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) {}

    @ApiOkResponse({ type: GeneratedApiKeyDto })
    @Post('createForUser')
    createForUser(
        @Body() createApiKeyForUserDto: CreateApiKeyForUserDto,
    ): Promise<GeneratedApiKeyDto> {
        return this.apiKeysService.createForUser(createApiKeyForUserDto);
    }

    @ApiOkResponse({ type: String })
    @Get('getByUserId')
    getByUserId(@Body() getApiKeyByUserIdDto: GetApiKeyByUserIdDto): Promise<ApiKey[]> {
        return this.apiKeysService.getByUserId(getApiKeyByUserIdDto);
    }
}
