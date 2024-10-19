import { IsNumberString } from 'class-validator';
import { PickType } from '@nestjs/swagger';

import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

export class DisableTfaDto extends PickType(CreateUserDto, ['email']) {
    @IsNumberString()
    readonly tfaToken: string;
}
