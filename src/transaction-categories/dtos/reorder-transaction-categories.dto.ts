import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ReorderParentTransactionCategoryDto } from 'transaction-categories/dtos/reorder-parent-transaction-category.dto';

export class ReorderTransactionCategoriesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReorderParentTransactionCategoryDto)
    readonly parentNodes: ReorderParentTransactionCategoryDto[];
}
