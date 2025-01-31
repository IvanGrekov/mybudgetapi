import { InternalServerErrorException } from '@nestjs/common';

import { Account } from 'shared/entities/account.entity';
import { EAccountStatus } from 'shared/enums/account.enums';

import { EditAccountDto } from 'accounts/dtos/edit-account.dto';
import { FindAllAccountsDto } from 'accounts/dtos/find-all-accounts.dto';

type TGetOldAccountNewOrder = (args: {
    oldAccount: Account;
    editAccountDto: EditAccountDto;
    findAllAccounts(args: FindAllAccountsDto): Promise<Account[]>;
}) => Promise<number>;

export const getOldAccountNewOrder: TGetOldAccountNewOrder = async ({
    oldAccount,
    editAccountDto,
    findAllAccounts,
}) => {
    const { status: oldStatus, type, user, order } = oldAccount;
    const { status: newStatus } = editAccountDto;

    const isStatusChanging = newStatus === EAccountStatus.ACTIVE && newStatus !== oldStatus;

    if (!isStatusChanging) {
        return order;
    }

    if (!user) {
        throw new InternalServerErrorException('Old Account has no User');
    }

    const accountsByType = await findAllAccounts({
        userId: user.id,
        types: [type],
    });

    return accountsByType.length;
};
