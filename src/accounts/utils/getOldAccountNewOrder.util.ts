import { InternalServerErrorException } from '@nestjs/common';

import { Account } from '../../shared/entities/account.entity';
import { EAccountStatus } from '../../shared/enums/account.enums';

import { EditAccountDto } from '../dtos/edit-account.dto';
import { FindAllAccountsDto } from '../dtos/find-all-accounts.dto';

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
    const { status, type, user, order } = oldAccount;
    const { status: newStatus, type: newType } = editAccountDto;

    const isTypeChanging = typeof newType !== 'undefined' && newType !== type;
    const isStatusChanging = newStatus !== status && newStatus === EAccountStatus.ACTIVE;

    if (!isTypeChanging && !isStatusChanging) {
        return order;
    }

    if (!user) {
        throw new InternalServerErrorException('Old Account has no User');
    }

    if (isTypeChanging) {
        const accountsByType = await findAllAccounts({
            userId: user.id,
            type: newType,
        });

        return accountsByType.length;
    }

    const accountsByOldType = await findAllAccounts({
        userId: user.id,
        type,
    });

    return accountsByOldType.length;
};
