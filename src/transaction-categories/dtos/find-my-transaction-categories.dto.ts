import { OmitType } from '@nestjs/swagger';

import { FindAllTransactionCategoriesDto } from './find-all-transaction-categories.dto';

export class FindMyTransactionCategoriesDto extends OmitType(FindAllTransactionCategoriesDto, [
    'userId',
]) {}
