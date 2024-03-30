import { PickType } from '@nestjs/mapped-types';
import { IsNumber as IsNumberBase, IsPositive } from 'class-validator';

import { PreloadAccountDto } from '../../shared/dtos/preload-account.dto';

export class EditAccountCurrencyDto extends PickType(PreloadAccountDto, ['currency']) {
    @IsNumberBase()
    @IsPositive()
    readonly rate: number;
}
