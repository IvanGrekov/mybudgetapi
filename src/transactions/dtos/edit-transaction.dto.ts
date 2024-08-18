import { PickType } from '@nestjs/swagger';

import { CreateTransactionDto } from './create-transaction.dto';

export class EditTransactionDto extends PickType(CreateTransactionDto, ['description']) {}
