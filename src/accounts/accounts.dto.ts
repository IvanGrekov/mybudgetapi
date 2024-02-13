import { IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

import { PreloadAccountDto } from '../shared/dto/preload-account.dto';

export class CreateAccountDto extends PreloadAccountDto {
  @IsNumber()
  readonly userId: number;
}

export class EditAccountDto extends PartialType(PreloadAccountDto) {}
