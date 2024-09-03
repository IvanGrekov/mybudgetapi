import { IsNumber as IsNumberBase, IsOptional } from 'class-validator';
import { OmitType } from '@nestjs/swagger';

import { PreloadTransactionCategoryDto } from '../../shared/dtos/preload-transaction-category.dto';

export class CreateTransactionCategoryDto extends OmitType(PreloadTransactionCategoryDto, [
    'order',
    'children',
]) {
    @IsNumberBase()
    readonly userId: number;

    @IsNumberBase()
    @IsOptional()
    readonly parentId?: number;
}
