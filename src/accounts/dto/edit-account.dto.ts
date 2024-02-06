import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateAccountDto } from './create-account.dto';

export class EditAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['userId'] as const),
) {}
