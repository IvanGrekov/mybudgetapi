import { PickType } from '@nestjs/swagger';
import { IsNumber as IsNumberBase, IsPositive } from 'class-validator';

import { PreloadAccountDto } from 'shared/dtos/preload-account.dto';

export class EditAccountCurrencyDto extends PickType(PreloadAccountDto, ['currency']) {
    @IsNumberBase()
    @IsPositive()
    readonly rate: number;
}
