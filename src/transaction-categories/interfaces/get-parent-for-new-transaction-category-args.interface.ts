import { ETransactionCategoryType } from '../../shared/enums/transaction-category.enums';

export interface IGetParentForNewTransactionCategoryArgs {
    parentId: number;
    userId: number;
    type: ETransactionCategoryType;
}
