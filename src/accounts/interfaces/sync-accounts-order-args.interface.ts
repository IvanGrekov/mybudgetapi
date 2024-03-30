import { QueryRunner } from 'typeorm';

import { EAccountType } from '../../shared/enums/account.enums';

export interface ISyncAccountsOrderArgs {
    queryRunner: QueryRunner;
    userId: number;
    type: EAccountType;
    excludeId?: number;
}
