import { ReorderAccountDto } from '../dtos/reorder-account.dto';

export interface IReorderAccountArgs {
    id: number;
    reorderAccountDto: ReorderAccountDto;
    activeUserId: number;
}
