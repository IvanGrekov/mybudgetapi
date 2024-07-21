import { PickType } from '@nestjs/mapped-types';

import { CreateTransactionDto } from './create-transaction.dto';

export class EditTransactionDto extends PickType(CreateTransactionDto, ['description']) {}
