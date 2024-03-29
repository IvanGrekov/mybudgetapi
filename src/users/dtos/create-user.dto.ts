import { IsEnum } from 'class-validator';

import IsString from '../../shared/property-decorators/is-string.decorator';
import { ECurrency } from '../../shared/enums/currency.enums';
import { ELanguage } from '../../shared/enums/language.enums';

import {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
} from '../constants/nickname.constants';

export class CreateUserDto {
  @IsString({
    minLength: NICKNAME_MIN_LENGTH,
    maxLength: NICKNAME_MAX_LENGTH,
  })
  readonly nickname: string;

  @IsEnum(ECurrency)
  readonly defaultCurrency: ECurrency;

  @IsEnum(ELanguage)
  readonly language: ELanguage;

  @IsString()
  readonly timeZone: string;
}
