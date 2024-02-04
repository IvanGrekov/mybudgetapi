import { ECurrency, ELanguage } from '../../entities/user.entity';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @MinLength(3)
  @IsString()
  readonly nickname: string;

  @IsEnum(ECurrency)
  readonly defaultCurrency: ECurrency;

  @IsEnum(ELanguage)
  readonly language: ELanguage;
}
