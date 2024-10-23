import { IsString } from 'class-validator';

export class InitiateTfaEnablingDtoResult {
    @IsString()
    readonly dataUrl: string;

    @IsString()
    readonly secret: string;
}
