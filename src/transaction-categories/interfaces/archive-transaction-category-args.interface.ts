import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IArchiveTransactionCategoryArgs {
  userId: number;
  transactionCategory: TransactionCategory;
  oldTransactionCategory: TransactionCategory;
}
