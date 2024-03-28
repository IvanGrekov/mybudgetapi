import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

export interface IGetParentForNewTransactionCategory {
  parentId: number;
  userId: number;
  type: ETransactionCategoryType;
}
