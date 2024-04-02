import { FindOptionsRelations } from 'typeorm';

import { TransactionCategory } from '../../shared/entities/transaction-category.entity';

type TGetNewTransactionCategoryOrder = (args: {
    transactionCategoryTemplate: TransactionCategory;
    activeTransactionCategories: TransactionCategory[];
    findOneTransactionCategory(
        id: TransactionCategory['id'],
        relations?: FindOptionsRelations<TransactionCategory>,
    ): Promise<TransactionCategory>;
}) => Promise<number>;

export const getNewTransactionCategoryOrder: TGetNewTransactionCategoryOrder = async ({
    transactionCategoryTemplate,
    activeTransactionCategories,
    findOneTransactionCategory,
}) => {
    const { parent, type } = transactionCategoryTemplate;

    if (parent) {
        const parentTransactionCategory = await findOneTransactionCategory(parent.id, {
            children: true,
        });

        return parentTransactionCategory.children.length;
    }

    const filteredTransactionCategories = activeTransactionCategories.filter(
        (transactionCategory) => transactionCategory.type === type,
    );

    return filteredTransactionCategories.length;
};
