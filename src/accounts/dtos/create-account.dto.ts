import { OmitType } from '@nestjs/swagger';
import { IsNumber as IsNumberBase } from 'class-validator';

import { PreloadAccountDto } from '../../shared/dtos/preload-account.dto';

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
    @IsNumberBase()
    readonly userId: number;
}
