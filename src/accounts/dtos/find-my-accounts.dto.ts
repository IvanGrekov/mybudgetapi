import { OmitType } from '@nestjs/swagger';

import { FindAllAccountsDto } from 'accounts/dtos/find-all-accounts.dto';

export class FindMyAccountsDto extends OmitType(FindAllAccountsDto, ['userId']) {}
