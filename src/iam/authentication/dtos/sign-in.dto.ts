import { PickType } from '@nestjs/swagger';

import { CreateUserDto } from '../../../shared/dtos/create-user.dto';

export class SignInDto extends PickType(CreateUserDto, ['email', 'password']) {}
