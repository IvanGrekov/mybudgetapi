import { ReorderAccountDto } from 'accounts/dtos/reorder-account.dto';

export interface IReorderAccountArgs {
    id: number;
    reorderAccountDto: ReorderAccountDto;
    activeUserId: number;
}
