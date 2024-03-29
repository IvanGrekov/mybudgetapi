import { QueryRunner } from 'typeorm';

import { ECurrency } from '../../shared/enums/currency.enums';

export interface IUpdateRelationsCurrencyArgs {
  queryRunner: QueryRunner;
  userId: number;
  currency: ECurrency;
  oldCurrency: ECurrency;
  rate: number;
  isForceCurrencyUpdate?: boolean;
}
