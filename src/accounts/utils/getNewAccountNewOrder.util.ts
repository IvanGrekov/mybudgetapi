import { EAccountType } from '../../shared/enums/account.enums';
import { Account } from '../../shared/entities/account.entity';

export const getNewAccountNewOrder = (activeAccounts: Account[], type: EAccountType): number => {
    const filteredAccounts = activeAccounts.filter((account) => account.type === type);

    return filteredAccounts.length;
};
