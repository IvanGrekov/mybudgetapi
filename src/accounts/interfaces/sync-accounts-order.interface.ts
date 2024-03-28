import { QueryRunner } from 'typeorm';

import { EAccountType } from '../../shared/enums/account.enums';

export interface ISyncAccountsOrder {
  queryRunner: QueryRunner;
  userId: number;
  type: EAccountType;
  excludeId?: number;
}
