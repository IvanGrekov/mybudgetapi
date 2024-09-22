import { PartialType, OmitType } from '@nestjs/swagger';

import { CreateUserDto } from '../../shared/dtos/create-user.dto';

export class EditUserDto extends PartialType(
    OmitType(CreateUserDto, ['defaultCurrency', 'language', 'userRole']),
) {}
