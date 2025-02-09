import { QueryRunner, UpdateResult } from 'typeorm';

import { EAccountType } from 'shared/enums/account.enums';
import { Account } from 'shared/entities/account.entity';

import { FindAllAccountsDto } from 'accounts/dtos/find-all-accounts.dto';

type TFindAllAccounts = (args: FindAllAccountsDto) => Promise<Account[]>;

type TSyncAccountsOrder = (args: {
    userId: number;
    type: EAccountType;
    excludeId?: number;
    findAllAccounts: TFindAllAccounts;
    updateAccount(id: number, account: Partial<Account>): Promise<UpdateResult>;
}) => Promise<void>;

const syncAccountsOrder: TSyncAccountsOrder = async ({
    userId,
    type,
    excludeId,
    findAllAccounts,
    updateAccount,
}) => {
    const accountsByType = await findAllAccounts({
        userId,
        types: [type],
        excludeId,
    });

    for (let order = 0; order < accountsByType.length; order++) {
        await updateAccount(accountsByType[order].id, { order });
    }
};

type TArchiveAccountArgs = (args: {
    account: Account;
    userId: number;
    createQueryRunner(): QueryRunner;
    getOneAccount(id: number): Promise<Account>;
    findAllAccounts: TFindAllAccounts;
}) => Promise<Account>;

export const archiveAccount: TArchiveAccountArgs = async ({
    account,
    userId,
    createQueryRunner,
    getOneAccount,
    findAllAccounts,
}) => {
    const { id: accountId, type } = account;

    const queryRunner = createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        await queryRunner.manager.update(Account, accountId, account);

        await syncAccountsOrder({
            userId,
            type,
            excludeId: accountId,
            findAllAccounts,
            updateAccount: (id, account) => queryRunner.manager.update(Account, id, account),
        });

        await queryRunner.commitTransaction();

        return getOneAccount(accountId);
    } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
    } finally {
        await queryRunner.release();
    }
};
