import { IsNumber } from 'class-validator';

import { PreloadAccountDto } from './preload-account.dto';

export class CreateAccountDto extends PreloadAccountDto {
  @IsNumber()
  readonly userId: number;
}
