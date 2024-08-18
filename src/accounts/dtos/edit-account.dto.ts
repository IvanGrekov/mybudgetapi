import { PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { EAccountStatus } from '../../shared/enums/account.enums';

import { CreateAccountDto } from './create-account.dto';

export class EditAccountDto extends PartialType(
    OmitType(CreateAccountDto, ['userId', 'currency', 'type']),
) {
    @IsEnum(EAccountStatus)
    @IsOptional()
    readonly status?: EAccountStatus;
}
