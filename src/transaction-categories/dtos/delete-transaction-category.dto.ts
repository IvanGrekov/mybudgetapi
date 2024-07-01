import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteTransactionCategoryDto {
    @IsBoolean()
    @IsOptional()
    shouldRemoveChildTransactionCategories?: boolean;
}
