import IsNumber from '../../shared/property-decorators/is-number.decorator';
import { MAX_ACCOUNTS_PER_USER } from '../constants/accounts-pagination.constants';

export class ReorderAccountDto {
    @IsNumber({
        max: MAX_ACCOUNTS_PER_USER,
    })
    readonly order: number;
}
