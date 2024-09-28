import { IsNumber as IsNumberBase } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiKeyByUserIdDto {
    @Type(() => Number)
    @IsNumberBase()
    userId: number;
}
