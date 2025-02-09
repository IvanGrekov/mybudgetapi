import { IsJSON, IsOptional } from 'class-validator';

export class CalculatedTransactionValuesDto {
    @IsOptional()
    @IsJSON()
    readonly to?: string;

    @IsOptional()
    @IsJSON()
    readonly from?: string;
}
