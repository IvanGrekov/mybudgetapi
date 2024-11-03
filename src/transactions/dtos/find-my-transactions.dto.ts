import { OmitType } from '@nestjs/swagger';

import { FindAllTransactionsDto } from 'transactions/dtos/find-all-transactions.dto';

export class FindMyTransactionsDto extends OmitType(FindAllTransactionsDto, ['userId']) {}
