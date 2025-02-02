import { IsNotEmpty } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from 'shared/dtos/create-user.dto';

export class SignUpDto extends OmitType(CreateUserDto, ['googleId']) {
    @IsNotEmpty()
    deviceId: string;
}
