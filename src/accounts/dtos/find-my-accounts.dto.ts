import { OmitType } from '@nestjs/swagger';

import { FindAllAccountsDto } from './find-all-accounts.dto';

export class FindMyAccountsDto extends OmitType(FindAllAccountsDto, ['userId']) {}
