import { PickType } from '@nestjs/swagger';

import { CreateTransactionDto } from 'transactions/dtos/create-transaction.dto';

export class EditTransactionDto extends PickType(CreateTransactionDto, ['description']) {}
