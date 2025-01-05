import { OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { PreloadAccountDto } from 'shared/dtos/preload-account.dto';

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
    @IsNumber()
    readonly userId: number;

    @IsString()
    @IsOptional()
    readonly iconColor?: string | null;
}
