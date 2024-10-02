import { IsNotEmpty } from 'class-validator';

export class GoogleIdTokenDto {
    @IsNotEmpty()
    token: string;
}
