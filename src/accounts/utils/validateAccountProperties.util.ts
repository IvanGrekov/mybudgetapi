import { BadRequestException } from '@nestjs/common';

import { EAccountType } from 'shared/enums/account.enums';

interface IValidateAccountPropertiesArgs {
    type?: EAccountType;
    shouldShowAsIncome?: boolean;
    shouldShowAsExpense?: boolean;
}

export const validateAccountProperties = ({
    type,
    shouldShowAsIncome,
    shouldShowAsExpense,
}: IValidateAccountPropertiesArgs): void => {
    if (shouldShowAsExpense && type !== EAccountType.I_OWE) {
        throw new BadRequestException('Only `i_owe` Accounts can have `shouldShowAsExpense`');
    }

    if (shouldShowAsIncome && type !== EAccountType.OWE_ME) {
        throw new BadRequestException('Only `owe_me` Accounts can have `shouldShowAsIncome`');
    }
};
