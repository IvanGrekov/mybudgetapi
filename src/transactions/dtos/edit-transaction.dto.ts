import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateTransactionDto } from './create-transaction.dto';

export class EditTransactionDto extends PartialType(OmitType(CreateTransactionDto, ['userId'])) {}
