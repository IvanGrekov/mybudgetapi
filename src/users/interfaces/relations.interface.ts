import { Account } from '../../shared/entities/account.entity';
import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

export interface IRelations {
    accounts: Account[];
    transactionCategories: TransactionCategory[];
}
