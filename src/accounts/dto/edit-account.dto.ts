import { OmitType } from '@nestjs/mapped-types';

import { CreateAccountDto } from './create-account.dto';

export class EditAccountDto extends OmitType(CreateAccountDto, [
  'userId',
] as const) {}
