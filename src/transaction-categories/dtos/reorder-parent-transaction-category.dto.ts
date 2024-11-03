import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ReorderTransactionCategoryDto } from 'transaction-categories/dtos/reorder-transaction-category.dto';

export class ReorderParentTransactionCategoryDto extends ReorderTransactionCategoryDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderTransactionCategoryDto)
    @IsOptional()
    readonly childNodes?: ReorderTransactionCategoryDto[];
}
