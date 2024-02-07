import { PartialType } from '@nestjs/mapped-types';

import { PreloadAccountDto } from './preload-account.dto';

export class EditAccountDto extends PartialType(PreloadAccountDto) {}
