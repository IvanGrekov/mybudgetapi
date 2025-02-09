import { OmitType } from '@nestjs/swagger';

import { FindMyTransactionsDto } from 'transactions/dtos/find-my-transactions.dto';

export class GetCalculatedTransactionValuesDto extends OmitType(FindMyTransactionsDto, [
    'limit',
    'offset',
    'search',
    'types',
]) {}
