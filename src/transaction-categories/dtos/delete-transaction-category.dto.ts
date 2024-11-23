import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteTransactionCategoryDto {
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    shouldRemoveChildTransactionCategories?: boolean;
}
