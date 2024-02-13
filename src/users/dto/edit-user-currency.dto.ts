import { PickType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class EditUserCurrencyDto extends PickType(CreateUserDto, [
  'defaultCurrency',
]) {
  @IsOptional()
  @IsBoolean()
  isForceCurrencyUpdate?: boolean;

  @IsOptional()
  @IsBoolean()
  isSoftCurrencyUpdate?: boolean;

  @IsOptional()
  @IsNumber()
  rate?: number;
}
