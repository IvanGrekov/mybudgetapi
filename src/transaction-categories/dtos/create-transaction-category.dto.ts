import { IsNumber, IsOptional, IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';

import { PreloadTransactionCategoryDto } from 'shared/dtos/preload-transaction-category.dto';

export class CreateTransactionCategoryDto extends OmitType(PreloadTransactionCategoryDto, [
    'order',
    'children',
]) {
    @IsNumber()
    readonly userId: number;

    @IsNumber()
    @IsOptional()
    readonly parentId?: number;

    @IsString()
    @IsOptional()
    readonly iconColor?: string;
}
