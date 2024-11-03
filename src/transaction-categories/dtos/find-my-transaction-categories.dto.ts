import { OmitType } from '@nestjs/swagger';

import { FindAllTransactionCategoriesDto } from 'transaction-categories/dtos/find-all-transaction-categories.dto';

export class FindMyTransactionCategoriesDto extends OmitType(FindAllTransactionCategoriesDto, [
    'userId',
]) {}
