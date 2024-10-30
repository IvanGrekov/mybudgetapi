import { FindOptionsRelations } from 'typeorm';

import { Account } from '../../shared/entities/account.entity';

export interface IGetOneAccountArgs {
    id: number;
    activeUserId?: number;
    relations?: FindOptionsRelations<Account>;
}
