import { OmitType } from '@nestjs/mapped-types';
import { IsNumber as IsNumberBase } from 'class-validator';

import { PreloadAccountDto } from '../../shared/dtos/preload-account.dto';

export class CreateAccountDto extends OmitType(PreloadAccountDto, ['order']) {
  @IsNumberBase()
  readonly userId: number;
}
