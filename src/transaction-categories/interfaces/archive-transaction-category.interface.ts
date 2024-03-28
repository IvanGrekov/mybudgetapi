import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IArchiveTransactionCategory {
  userId: number;
  transactionCategory: TransactionCategory;
  oldTransactionCategory: TransactionCategory;
}
